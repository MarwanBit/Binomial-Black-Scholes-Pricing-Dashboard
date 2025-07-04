from typing import Union
from fastapi import FastAPI

import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import math
from scipy.stats import norm
from polygon import RESTClient
import pandas as pd
import datetime
import yfinance as yf
import datetime as dt
from scipy.stats import norm
import time
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from scipy.interpolate import griddata
import numpy as np

from typing import Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi import Request

import base64
import io


from fastapi.middleware.cors import CORSMiddleware

origins = ["http://localhost:8080", "http://localhost"]


client = RESTClient(api_key="bYx0g7_YgYXQsq1msFy5zo8KmEAXpc1y")


def calc_d1(S, K, r, vol, T, t):
    epsilon = 1e-8
    num = math.log(float(S) / float(K)) + (r + (vol) ** 2 / 2) * (T - t)
    denom = vol * math.sqrt(T - t + epsilon)
    return num / denom


def calc_d2(S, K, r, vol, T, t):
    d1 = calc_d1(S, K, r, vol, T, t)
    return d1 - vol * math.sqrt(T - t)


def blackScholesOptionPrice(S, K, r, vol, T, t):
    d1, d2 = calc_d1(S, K, r, vol, T, t), calc_d2(S, K, r, vol, T, t)
    return S * norm.cdf(d1) - K * math.exp(-r * (T - t)) * norm.cdf(d2)


def options_chains(ticker):
    asset = yf.Ticker(ticker)
    expirations = asset.options
    chains = (
        pd.DataFrame()
    )  # tuple of strings of dates i.e ("2025-06-20", ..., "2025-07-03")
    for expiration in expirations:
        # tuple of two dataframes
        opt = asset.option_chain(
            expiration
        )  # what is an option chain object?? (https://www.investopedia.com/terms/o/optionchain.asp)
        calls = opt.calls
        calls["optionType"] = "call"
        puts = opt.puts
        puts["optionType"] = "put"

        chain = pd.concat([calls, puts])
        chain["expiration"] = pd.to_datetime(expiration) + pd.DateOffset(
            hours=23, minutes=59, seconds=59
        )  # sets the expiration to the next day
        chains = pd.concat([chains, chain])
    chains["daysToExpiration"] = (
        chains.expiration - dt.datetime.today()
    ).dt.days + 1  # calculates days till expiration

    chains = chains[chains["optionType"] == "call"]
    chains["T"] = chains["daysToExpiration"] / 365

    stock = yf.Ticker("TSLA")
    price = stock.info["regularMarketPrice"]
    chains["S0"] = price

    chains["K"] = chains["strike"]

    # you should use the risk free rate corresponding to the lending period, for example if we are lending 1-3 months we use SHV (iShares Short Treasury ETF)
    # SHY for 1-3 years, etc.
    # use FRED API for more accurate treasury rates

    # 1-3 month ETF
    ticker = yf.Ticker("SHV")
    info = ticker.info
    latest_r_one_to_three_months = info.get("dividendYield")
    print(
        f"Latest close price for SHV ETF (1-3 month ETF): {latest_r_one_to_three_months}"
    )

    # 1-3 years ETF
    ticker = yf.Ticker("SHY")
    info = ticker.info
    latest_r_one_to_three_years = info.get("dividendYield")
    print(
        f"Latest close price for SHV ETF (1-3 year ETF): {latest_r_one_to_three_years}"
    )

    # Now that we have approximations for the risk-Free rate, we can begin to
    THREE_MONTH_T = (
        0.2548  # this is approximately 3*31 / 365  (i.e 3 months in days / 365)
    )
    chains["r"] = np.where(
        chains["T"] > THREE_MONTH_T,
        latest_r_one_to_three_years,
        latest_r_one_to_three_months,
    )  # conditionally set the risk free rate for the data
    return chains


# Now we will begin by creating the function which is supposed to calculate the implied volatility.
def calculate_implied_volatility(
    n_steps: int, C_mkt: float, T: float, S0: float, K: float, r: float, hist_vol: float
):
    # notice we want to calculate
    moneyness = S0 / K
    if moneyness > 1.1:
        sigma = hist_vol * 0.8
    elif moneyness < 0.9:
        sigma = hist_vol * 1.2
    else:
        sigma = hist_vol
    for i in range(n_steps):
        d1 = calc_d1(S0, K, r, sigma, T, 0)
        C_bs = blackScholesOptionPrice(S0, K, r, sigma, T, 0)
        diff = C_bs - C_mkt
        vega = S0 * math.sqrt(T) * norm.pdf(d1)
        if abs(diff) < 1e-6:
            break
        if vega < 1e-8:
            break

        update = diff / vega

        # damp to prevent overshooting
        damping_factor = min(1, 0.5 / abs(update)) if abs(update) > 0 else 1.0
        sigma -= update * damping_factor

        # Ensure reasonable volatility values
        sigma = max(1e-8, min(2.0, sigma))

    # print("implied volatility is {:.2f}".format(sigma))
    return sigma


def calc_hist_vol(ticker):
    aggs = []
    for a in client.list_aggs(
        ticker=ticker,
        multiplier=1,
        timespan="day",
        from_=datetime.datetime.now().date() - datetime.timedelta(days=30),
        to=datetime.datetime.now().date(),
        limit=50000,
    ):
        time.sleep(0.25)  # dealing with rate limiting problems
        aggs.append(a)

    # Dataframe containing all the stock information/ prices from 2023-01-01 to 2023-06-13
    df = pd.DataFrame(aggs)

    # here we only select the relevant columns and drop all other unnecessary information
    df = df[["close", "timestamp"]]
    df = df.dropna()

    # here we transform the timestamp to a datetime
    df["date"] = df["timestamp"].apply(
        lambda x: datetime.datetime.fromtimestamp(x / 1000)
    )
    df = df[["close", "date"]]
    df.set_index("date")
    df.loc[1:, "Price Relative"] = (
        df["close"].iloc[1:] / df["close"].shift(1).iloc[1:]
    )  # calculates S_{t} / S_{t-1} for each row t
    # the above is also the same as the line below
    # df["price Relative"] = df["close"].iloc[1:] / df["close"].shift(1).iloc[1:]
    df.loc[1:, "Daily Log Return"] = np.log(df.loc[1:, "Price Relative"])

    DailyVolatility = df.loc[1:, "Daily Log Return"].std()
    print("The daily volatility of TSLA is {:.2%}".format(DailyVolatility))
    print(
        "The annualized daily volatility measured in trading days is {:.2%}".format(
            DailyVolatility * math.sqrt(252)
        )
    )
    return DailyVolatility


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/get_market_data/{ticker}")
def get_market_data(ticker: str):
    chains = options_chains(ticker)
    chains = chains.reset_index(drop=True)
    chains.replace({np.nan: None})
    chains = chains[chains.isna().any(axis=1) == False]
    chains = chains.reset_index()
    coords = pd.DataFrame(["Moneyness", "Time to Expiration", "Implied Volatility"])
    hist_vol = calc_hist_vol("TSLA")
    N_STEPS = 100
    for index, row in chains.iterrows():
        T, S0, K, r, C_mkt = row["T"], row["S0"], row["K"], row["r"], row["lastPrice"]
        # print(f"T={T:.4f}, S0={S0}, K={K}, r={r}, C_mkt={C_mkt}")
        moneyness = S0 / K
        time_to_expiry = T
        implied_vol = calculate_implied_volatility(
            N_STEPS, C_mkt, T, S0, K, r, hist_vol
        )
        new_row = pd.DataFrame(
            [
                {
                    "Moneyness": moneyness,
                    "Time to Expiry": time_to_expiry,
                    "Implied Volatility": implied_vol,
                }
            ]
        )
        coords = pd.concat([coords, new_row], ignore_index=True)
    coords = coords.dropna(subset=["Moneyness", "Time to Expiry", "Implied Volatility"])
    points = np.array(
        coords[["Moneyness", "Time to Expiry", "Implied Volatility"]].values
    )
    x = points[:, 0]
    y = points[:, 1]
    z = points[:, 2]

    # Create a 2D grid for x and y
    xi = np.linspace(min(x), max(x), 100)
    yi = np.linspace(min(y), max(y), 100)
    xi, yi = np.meshgrid(xi, yi)

    # Interpolate z values
    zi = griddata((x, y), z, (xi, yi), method="cubic")

    zi = np.nan_to_num(zi, nan=np.nanmean(zi))

    response = {
        "moneyness": xi.tolist(),
        "time_to_expiry": yi.tolist(),
        "implied_volatility": zi.tolist(),
        "stock": ticker,
    }
    return response


@app.get("/get_candlestick_data/{symbol}")
def get_candlestick_data(symbol: str):
    ticker = yf.Ticker(symbol)
    data = ticker.history(period="1mo", interval="1d")  # the date is the index
    data = data.reset_index()  # here we reset the index
    data["Date"] = data["Date"].dt.strftime("%Y-%m-%d %H:%M:%S")
    response = {"data": data.to_dict(orient="records"), "stock": symbol}
    return response


@app.post("/get_opt_price")
async def get_opt_price(request: Request):
    try:
        data = await request.json()
        # get the fields
        # stock = data.get("stock")
        strike_price = float(data.get("strike-price"))
        risk_free_rate = float(data.get("risk-free-rate"))
        time_to_expiry = float(data.get("time-to-expiry"))
        volatility = float(data.get("volatility"))
        current_stock_price = float(data.get("current-stock-price"))

        call_price = blackScholesOptionPrice(
            current_stock_price,
            strike_price,
            risk_free_rate,
            volatility,
            time_to_expiry,
            0,
        )

        return JSONResponse(
            {
                "status": "success",
                "message": "Form submitted successfully",
                "data": {"optionPrice": call_price},
            }
        )

    except Exception as e:
        return JSONResponse(
            status_code=500, content={"status": "error", "message": str(e)}
        )
