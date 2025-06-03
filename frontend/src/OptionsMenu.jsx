import {useState} from "react";

function OptionsMenu() {
    const [formData, setFormData] = useState({
        "strike-price": "TESLA",
        "risk-free-rate": "0.001",
        "time-to-expiry": "20.00s",
        "volatility": "12",
        "current-stock-price": "14.00",
    });

    const handleSubmit = () => {
        console.log("NOT IMPLEMENTED YET!");
    }

    const handleChange = (e) => {
        e.preventDefault();
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-row justify-between">
                    <label>Strike Price:</label>
                    <input
                        type="text"
                        name="strike-price"
                        value={formData["strike-price"]}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex flex-row justify-between">
                    <label>Risk Free Rate:</label>
                    <input 
                        type="text"
                        name="risk-free-rate"
                        value={formData["risk-free-rate"]}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex flex-row justify-between">
                    <label>Time to Expiry:</label>
                    <input
                        type="text"
                        name="time-to-expiry"
                        value={formData["time-to-expiry"]}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex flex-row justify-between">
                    <label>(Estimated) Volatility:</label>
                    <input 
                        type="text"
                        name="volatility"
                        value={formData["volatility"]}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex flex-row justify-between">
                    <label>Current Stock Price:</label>
                    <input
                        type="text"
                        name="current-stock-price"
                        value={formData["current-stock-price"]}
                        onChange={handleChange}
                        required
                    />
                </div>

            </form>
        </>
    );
}

export default OptionsMenu;