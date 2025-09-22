# booktracker
**Booktracker** is an open source application for managing and tracking a personal book library. 

Using metadata grabbed from Google Books, easily add books and organize them into collections. Set each book’s status, give it a rating, and track how long it took to read. 

**Disclaimer:** I am an English Lit graduate learning to program, and Booktracker is my first major project. Booktracker is still under active development, so expect bugs and breaking changes.

![Collection Page](/screenshots/collections.JPG)

## Features

- Add books with metadata provided by the Google Books API.
- Add books manually without using an external metadata provider.
- Organize books into collections.
- Create custom reading/writing challenges and track your progress.
- Write private journal entries about a book.
- View book-related statistics like books read per month, etc. 
- Multi-user support.
- Import book data and bookshelves from Goodreads.
- Export data to JSON or CSV.
- **Dark Mode Support** - Toggle between light and dark themes with a single click.
- **Flexible Progress Tracking** - Choose between page-based or percentage-based progress tracking for your reading.

## New Features

### 🌙 Dark Mode
Booktracker now includes a comprehensive dark mode that can be toggled from any page using the moon/sun icon in the navigation bar. The dark mode includes:
- Dark backgrounds and light text for better readability in low-light conditions
- Consistent theming across all pages and components
- Persistent theme preference (remembers your choice across sessions)
- Smooth transitions between light and dark modes

### 📊 Progress Tracking Options
Choose how you want to track your reading progress:
- **Page-based tracking**: Traditional page number tracking (e.g., "I'm on page 150 of 300")
- **Percentage-based tracking**: Decimal percentage tracking (e.g., "I'm 25.5% through the book")
- Toggle between modes in Settings to match your preferred reading style

## Installation

**Docker Compose (recommended)**

> **Note:** Docker images are automatically built and published to GitHub Container Registry (ghcr.io) on every commit to the main branch. The latest image is always available at `ghcr.io/nowjon/booktracker:latest`.

1. Paste this `docker-compose.yml` file into an empty directory, replacing with the correct info where necessary
    
    ```yaml
    version: "3.3"

    services:
        booktracker:
            image: ghcr.io/nowjon/booktracker:latest
            restart: unless-stopped
            volumes:
                - ./data:/app/external
            ports:
                - 2341:5000 #replace 2341 with your desired port.
    ```
    
2. Create the `data` directory with the following three subdirectories: 
    - `db`
    - `log`
    - `export`

   Before starting the container, make sure that the directory strucutre looks like this: 
    ```
   booktracker/
    ├── docker-compose.yml
    └── data/
        ├── db
        ├── log
        └── export
    ```
    
3. Start the container (from the same directory as your `docker-compose.yml` file): 
    
    ```bash
    docker compose up -d
    ```

## Screenshots

**Home Page**

![Home Page](/screenshots/home.JPG)

**Challenge Page**

![Challenge Page](/screenshots/challenges.png)
**Main Book Page**

![Main Book Page](/screenshots/bookList.JPG)

**Settings**

![Settings](/screenshots/settings.JPG)

**Users**

![Users](/screenshots/Users.JPG)
 
