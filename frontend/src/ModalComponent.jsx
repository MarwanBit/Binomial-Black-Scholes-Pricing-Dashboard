import React, { useState } from 'react'

function PopupExample() {
  const [showPopup, setShowPopup] = useState(false)

  const handleOpen = () => setShowPopup(true)
  const handleClose = () => setShowPopup(false)

  return (
    <div className="p-4">
      <button
        onClick={handleOpen}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Open Popup
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">This is a Popup</h2>
            <p>Here’s some content inside the popup window.</p>
            <button
              onClick={handleClose}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PopupExample
