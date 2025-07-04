from __future__ import annotations
from jax import grad
import math
import jax.numpy as jnp
from jax.scipy.stats import norm
from py_vollib.black import black
import py_vollib_vectorized
import pytest
import random

# run the tests with pytest Implied_Volatility_Tests.py


def calc_d1(S: float, K: float, r: float, vol: float, T: float, t: float) -> float:
    num = jnp.log(S / K) + (r + 0.5*(vol) ** 2) * (T - t)
    denom = vol * jnp.sqrt(T - t)
    return num / denom


def calc_d2(S: float, K: float, r: float, vol: float, T: float, t: float) -> float:
    d1 = calc_d1(S, K, r, vol, T, t)
    return d1 - vol * jnp.sqrt(T - t)

# call options price
def blackScholesOptionPrice(S: float, K: float, r: float, vol: float, T: float, t: float) -> float:
    d1 = calc_d1(S, K, r, vol, T, t)
    d2 = calc_d2(S, K, r, vol, T, t)
    return S * norm.cdf(d1) - K * jnp.exp(-r * (T - t)) * norm.cdf(d2)


# Now let's do this, we want to find the zero's of this function
def loss(S: float, K: float, r: float, vol: float, T: float, t: float, call_price: float) -> float:
    theoretical_price = blackScholesOptionPrice(S, K, r, vol, T, t)
    actual_price = call_price
    return theoretical_price - actual_price


def bisection_solve_for_implied_volatility(
                                    S: float, K: float, r: float, vol_left: float, vol_right: float, T: float, t: float,
                                    call_price: float,
                                    n_steps: int, tolerance: float, verbose: bool = False
                                ) -> float:
    MAX_VOL = 20.00
    MAX_INTERVAL_SIZE = 1e-6
    for _ in range(n_steps):
        f_left = loss(S, K, r, vol_left, T, t, call_price)
        f_right = loss(S, K, r, vol_right, T, t, call_price)
        
        if f_left * f_right > 0:
            vol_left = vol_left - (vol_left - 0) / 2
            vol_right = vol_right + (MAX_VOL - vol_right) / 2
            if vol_right > MAX_VOL:
                raise ValueError("vol_right is greater than the maximum allowed volatility in bisection solver :(")
            continue 

        vol_mid = (vol_right + vol_left) / 2
        f_mid = loss(S, K, r, vol_mid, T, t, call_price)

        if (verbose):
            print(f"Currently solving the problem, current value of diff between Expected and Actual: {f_mid:.6f}")

        if abs(f_mid) < tolerance:
            return vol_mid
        
        if f_left * f_mid < 0:
            vol_right = vol_mid
        else:
            vol_left = vol_mid

        if abs(vol_right - vol_left) < MAX_INTERVAL_SIZE:
            raise ValueError("Interval to small when performing BISECTION method :(")
        
    # incase we do not converge
    raise ValueError("Error, non convergence when using bisection method :(")
    
        


def newton_raphson_solve_for_implied_volatility(
                                    S: float, K: float, r: float, vol: float, T: float, t: float,
                                    call_price: float,
                                    n_steps: int, tolerance: float, verbose: bool = False
                                ) -> float:
    loss_grad = grad(loss, argnums=3)
    learning_rate = 0.5
    for _ in range(n_steps):

        diff = loss(S, K, r, vol, T, t, call_price)

        if (verbose):
            print(f"Current Difference in Theoretical Price v.s. Actual Price: {diff}")

        if abs(diff) < tolerance:
            return vol
        
        f_prime = loss_grad(S, K, r, vol, T, t, call_price)

        if abs(f_prime) < 1e-8:
            raise ValueError("derivative when using Newton Raphson is to small :(")
 
        vol = vol - learning_rate * (diff / f_prime)

    if (verbose):
        print(f"Warning convergence not reached after {n_steps} steps, the final vol is {vol:.6f}")

    return vol


@pytest.mark.parametrize("S,K,r,vol,T,t", [
    (120.00, 100.00, 0.05, 0.2, 1.0, 0.0),
    (80.00, 90.00, 0.05, 0.88, 1.0, 0.33),
    (100.00, 150.00, 0.05, 0.38, 1.0, 0.0),
    (50.00, 250.00, 0.05, 0.45, 1.0, 0.99)
])
def test_black_scholes_price(S: float, K:float , r: float, vol: float, T: float, t: float) -> float:
    tolerance = 1e-3
    expect_price = py_vollib_vectorized.models.vectorized_black_scholes("c", S, K, (T-t), r, vol).iloc[0,0]
    calculated_price = blackScholesOptionPrice(S, K, r, vol, T, t)
    assert abs(expect_price - calculated_price) < tolerance, f"Price mismatch: expected {expect_price}, got {calculated_price}"


def test_black_scholes_price_random():
    N_TESTS = 2000
    tolerance = 1e-3
    for _ in range(N_TESTS):
        S = random.uniform(20.00, 2000.00)
        K = random.uniform(20.00, 4000.00)
        r = random.uniform(0.0, 1.0)
        T = random.uniform(0.0, 4.0)
        t = T - random.uniform(0.0, T)
        vol = random.uniform(0.0, 1.0)

        expect_price = py_vollib_vectorized.vectorized_black_scholes("c", S, K, (T-t), r, vol).iloc[0,0]
        calculated_price = blackScholesOptionPrice(S, K, r, vol, T, t)
        assert abs(expect_price - calculated_price) < tolerance, f"Price mismatch: expected {expect_price}, got {calculated_price}"


def test_bisection_implied_volatility():
    tolerance = 1e-3
    N_STEPS = 2000
    N_TESTS = 10
    for _ in range(N_TESTS):
        S = random.uniform(20.00, 4000.00)
        K = random.uniform(20.00, 8000.00)
        r = random.uniform(0.0, 1.0)
        vol_left = 1e-6
        vol_right = 20.00
        T = random.uniform(0.0, 4.0)
        t = random.uniform(0.0, T)
        call_price = random.uniform(
            max(0,S - K*math.exp(-r*(T-t))),  
            S
            )
        flag = 'c'

        expect_implied_vol = py_vollib_vectorized.vectorized_implied_volatility(call_price, S, K, (T-t), r, flag, q=0, return_as="numpy")
        calculated_implied_vol = bisection_solve_for_implied_volatility(
            S, K, r, vol_left, vol_right, T, t,
            call_price, N_STEPS, tolerance, False
        )
        assert abs(expect_implied_vol - calculated_implied_vol) < tolerance, f"Price mismatch: expected {expect_implied_vol}, got {calculated_implied_vol}"       


def test_newton_raphson_implied_volatility():
    tolerance = 1e-3
    MIN_VOL = 1e-6
    N_STEPS = 2000
    N_TESTS = 10
    for _ in range(N_TESTS):
        S = random.uniform(20.00, 4000.00)
        K = random.uniform(20.00, 8000.00)
        r = random.uniform(0.0, 1.0)
        vol = random.uniform(1e-6, 20.00)
        T = random.uniform(0.0, 4.0)
        t = random.uniform(0.0, T)
        call_price = random.uniform(
            max(0,S - K*math.exp(-r*(T-t))), 
            S
            )
        flag = 'c'

        expect_implied_vol = py_vollib_vectorized.vectorized_implied_volatility(call_price, S, K, (T-t), r, flag, q=0, return_as="numpy")
        calculated_implied_vol = newton_raphson_solve_for_implied_volatility(
            S, K, r, vol, T, t,
            call_price, N_STEPS, tolerance, False
        )
        assert abs(expect_implied_vol - calculated_implied_vol) < tolerance, f"Price mismatch: expected {expect_implied_vol}, got {calculated_implied_vol}"