
# Blockchain implementation in Go with REST API and Ed25519 signatures

> **Educational Project (Coursework)**  
> A simplified blockchain implementation in **Go** featuring a web interface for visualizing the block chain and adding cryptographically signed records.

## About the Project

**Vision Chain** is a demonstration application developed as part of my second-year coursework. The project implements the fundamental principles of Distributed Ledger Technology (DLT) using strict typing and modern cryptography:
*   **Data Integrity:** Each block contains the hash of the previous block. Any attempt to alter history invalidates the entire chain.
*   **Cryptographic Signatures:** Every transaction is signed using an **Ed25519** key pair, ensuring sender authenticity.
*   **REST API:** The backend is built with the **Echo** framework, providing high performance and clean code structure.

The application allows users to add text data or small files (converted to Base64) to the blockchain, visualizing the block formation process in real-time.

## Tech Stack

### Backend
*   **Language:** Go (Golang).
*   **Framework:** Echo v5 (for routing and HTTP request handling).
*   **Cryptography:** `crypto/ed25519` (for key generation and transaction signing), `crypto/sha256`.
*   **Utilities:** `google/uuid` (for unique participant identification).

### Frontend
*   **Core:** HTML5, CSS3 (Custom Properties, Flexbox/Grid), Vanilla JavaScript (ES6+).
*   **Styling:** Dark Minimal UI (inspired by GitHub Dark Dimmed).
*   **Logic:** Asynchronous API interaction via Fetch.

## Features

1.  **Transaction Creation:** Add records from a sender with arbitrary data payload.
2.  **File Upload:** Convert small files (<2MB) into Base64 strings to store them directly within a block.
3.  **Chain Validation:** Server-side check of hash continuity (`PreviusHash`) on every request to ensure integrity.
4.  **Visualization:** Real-time display of blocks, hashes, timestamps, and content.
5.  **Detailed View:** Modal window showing full block information and all included transactions.

## Installation & Setup

### Prerequisites
*   **Go** installed (version 1.21+ recommended).
*   Any modern web browser.

### Instructions

1.  Clone the repository:
    ```bash
    git clone https://github.com/Sweesz/coursework-blockchain.git
    cd coursework-blockchain
    ```

2.  Install Go dependencies:
    ```bash
    go mod tidy
    ```

3.  Run the server:
    ```bash
    go run main.go
    ```

4.  Open your browser and navigate to:
    ```
    http://localhost:8080
    ```

## Project Structure

```text
├── main.go             # Entry point: Echo server setup & blockchain logic
├── index.html          # Main application page
├── blockchain/         # Package: Block structure & hashing implementation
│   └── block.go
├── Graph/              # Package: Data models (Transactions)
│   └── transaction.go
└── static/             # Static assets for the frontend
    ├── css/
    │   └── style.css   # Interface styles (Dark Minimal UI)
    └── js/
        └── main.js     # Client-side logic (API requests, rendering)
```
## Educational Goals

This project was created to deeply understand:
*   The **Go** programming language and its standard library.
*   Hashing algorithms and block chaining principles.
*   Asymmetric cryptography (**Ed25519**).
*   Building RESTful APIs using the **Echo** framework.
*   Developing responsive user interfaces without heavy JS frameworks.

## License

This project is educational and distributed freely. Commercial use is not intended.

---
*Developed by Vorontsov Y.N (Sweesz). as part of academic coursework.*
