import {useState} from "react";

function OptionsMenu() {
    const [formData, setFormData] = useState({
        "stock": "TESLA",
        "strike-price": "12.00",
        "risk-free-rate": "0.001",
        "time-to-expiry": "20.00s",
        "volatility": "12",
        "current-stock-price": "14.00",
    });

    const [optionPrice, setOptionPrice] = useState(0.0);

    const handleSubmit = async (e) => {
        e.preventDefault(); // prevent default form submission
        try {
            const response = await fetch("http://localhost:8000/get_opt_price",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }, 
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            console.log("Received the data: ", data);
            setOptionPrice(data.data.optionPrice);
        } catch(error) {
            console.log(error);
        }
    }

    const handleChange = (e) => {
        e.preventDefault();
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    }

    return (
        <>
            <form 
                onSubmit={handleSubmit}
                className="bg-blue-100 m-4 rounded-lg shadow-md"
            >
                <div className="flex flex-col justify-between hover:bg-blue-200">
                    <label>Stock:</label>
                    <input
                        className="text-center"
                        type="text"
                        name="stock"
                        value={formData["stock"]}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex flex-col justify-between hover:bg-blue-200">
                    <label>Strike Price:</label>
                    <input
                        className="text-center"
                        type="text"
                        name="strike-price"
                        valuue={formData["strike-price"]}
                        onChange={handleChange}
                        required
                    >
                    </input>
                </div>

                <div className="flex flex-col justify-between hover:bg-blue-200">
                    <label>Risk Free Rate:</label>
                    <input 
                        className="text-center"
                        type="text"
                        name="risk-free-rate"
                        value={formData["risk-free-rate"]}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex flex-col justify-between hover:bg-blue-200">
                    <label>Time to Expiry:</label>
                    <input
                        className="text-center"
                        type="text"
                        name="time-to-expiry"
                        value={formData["time-to-expiry"]}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex flex-col justify-between hover:bg-blue-200">
                    <label>(Estimated) Volatility:</label>
                    <input 
                        className="text-center"
                        type="text"
                        name="volatility"
                        value={formData["volatility"]}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex flex-col justify-between hover:bg-blue-200">
                    <label>Current Stock Price:</label>
                    <input
                        className="text-center"
                        type="text"
                        name="current-stock-price"
                        value={formData["current-stock-price"]}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
                    >
                    Get your Option Price!
                </button>

            </form>

            Option Price: {optionPrice}
        </>
    );
}

export default OptionsMenu;