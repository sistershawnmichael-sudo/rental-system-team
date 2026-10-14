Vehicle Rental API

A simple RESTful API built with Node.js, Express.js, and CORS for retrieving vehicle information in a vehicle rental system. The API provides endpoints to view all vehicles and retrieve a specific vehicle by its ID.

Features
Retrieve all vehicles.
Retrieve a single vehicle by ID.
Return JSON responses.
Handle requests for vehicles that do not exist.
Enable Cross-Origin Resource Sharing (CORS).
Use sample vehicle data for testing.
Technologies Used
Node.js – JavaScript runtime.
Express.js – Web framework for Node.js.
CORS – Middleware that enables cross-origin requests.
Requirements

Make sure you have the following installed:

Node.js
npm (Node Package Manager)
Installation
Clone or download this project to your local machine.
Open a terminal in the project directory.
Initialize a Node.js project if you have not already done so:
   npm init -y

Install the required dependencies:
   npm install express cors

Make sure your server code is saved in a file named server.js.
Running the Server

Start the server by running:

node server.js


If the server starts successfully, the terminal will display:

Server running at http://localhost:5000


The API will be available at:

http://localhost:5000

API Endpoints
1. Home Route

Endpoint: GET /

Returns a message confirming that the API is running.

Example URL:

GET http://localhost:5000/


Response:

Vehicle Rental API is running!

2. Get All Vehicles

Endpoint: GET /api/vehicles

Returns a list of all vehicles in the system.

Example URL:

GET http://localhost:5000/api/vehicles


Example Response:

[
  {
    "id": 1,
    "brand": "Toyota",
    "model": "Vios",
    "plateNumber": "ABC-1234",
    "pricePerDay": 1500,
    "status": "Available"
  },
  {
    "id": 2,
    "brand": "Honda",
    "model": "Civic",
    "plateNumber": "XYZ-5678",
    "pricePerDay": 2500,
    "status": "Rented"
  },
  {
    "id": 3,
    "brand": "Mitsubishi",
    "model": "Mirage",
    "plateNumber": "DEF-9012",
    "pricePerDay": 1200,
    "status": "Available"
  }
]


Status Code: 200 OK

3. Get Vehicle by ID

Endpoint: GET /api/vehicles/:id

Returns the details of a specific vehicle based on its ID.

Example URL:

GET http://localhost:5000/api/vehicles/1


Example Response:

{
  "id": 1,
  "brand": "Toyota",
  "model": "Vios",
  "plateNumber": "ABC-1234",
  "pricePerDay": 1500,
  "status": "Available"
}


Status Code: 200 OK

If the vehicle ID does not exist, the API returns:

{
  "message": "Vehicle not found"
}


Status Code: 404 Not Found

Sample Vehicle Data

The API currently contains three sample vehicles.

ID	Brand	Model	Price Per Day	Status
1	Toyota	Vios	1,500	Available
2	Honda	Civic	2,500	Rented
3	Mitsubishi	Mirage	1,200	Available

Note: Prices are represented as numeric values. The currency is not explicitly defined in the source code.

Testing the API

You can test the endpoints using any of the following:

A web browser for the home route and GET requests.
Postman for sending HTTP requests.
Thunder Client for testing API endpoints in Visual Studio Code.

Try these URLs after starting the server:

http://localhost:5000/
http://localhost:5000/api/vehicles
http://localhost:5000/api/vehicles/1
http://localhost:5000/api/vehicles/99


The last URL should return a 404 Not Found response because vehicle ID 99 does not exist.

Project Structure
vehicle-rental-api/
├── node_modules/
├── package.json
├── package-lock.json
├── server.js
└── README.md


The node_modules/ and package files are generated or maintained by npm.

Current Limitations
Vehicle data is stored in an in-memory array.
Data is not saved to a database.
Vehicle information resets to the original sample data whenever the server restarts.
Only GET endpoints are implemented.
Adding, updating, deleting, or renting vehicles is not currently supported.
Future Improvements
Connect the API to a database such as MongoDB or MySQL.
Add POST, PUT, and DELETE endpoints.
Implement vehicle rental and return functionality.
Add request validation and improved error handling.
Use environment variables to configure the server port.
License

This project is intended for learning and development purposes. Add a license if you plan to distribute or publish it publicly.