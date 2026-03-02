# EComp-pass

a digital hall pass system built for robotics competitions. students can submit a pass using their ids, and admins can track whos out in real time to help prevent people from getting lost or getting the team discoordinated.

## what it does

- students submit a pass with their id, a partner id, where they are, and where theyre going
- passes show up on the admin dashboard instantly
- admin can see whos currently out with a live timer showing how long theyve been gone
- students can mark their pass as "arrived" or cancel it from their device
- search bar on admin page to filter through passes
- form data saves to localstorage so students dont have to re-enter their id every time

## tech stack

- **backend:** flask + sqlite
- **frontend:** vanilla js, no frameworks
- **styling:** plain css with dark mode support

## setup

1. clone the repo

```
git clone https://github.com/yourusername/ecompass.git
cd ecompass
```

2. install flask

```
pip install flask
```

3. set up the database

```
sqlite3 passes.db "CREATE TABLE passes (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT, partner_id TEXT, from_location TEXT, to_location TEXT, time_left TEXT, time_arrived TEXT, status TEXT);"
```

4. add your students to `students.json`

```json
{
  "123456": "John Smith",
  "654321": "Jane Doe"
}
```

5. run it

```
python app.py
```

then go to `localhost:5431` for the student page and `localhost:5431/admin` for the dashboard.

## project structure

```
ecompass/
├── app.py                  # main app backend
├── students.json           # student ids and student names
├── passes.db               # sqlite database (create this on setup)
├── templates/
│   ├── index.html          # student page
│   └── admin.html          # admin dashboard
└── static/
    ├── css/
    │   ├── style.css       # student page styles
    │   └── admin.css       # admin page styles
    └── js/
        ├── index.js        # student page logic
        └── admin.js        # admin dashboard logic
```

## how it works

students enter their id and a partners and fill out where they are and where they are going, this data will be sent to the backend and put into the db. Then the admin portal will fetch data from the db every second helping teachers know where students are so they dont get lost. on the student side once they fill out a pass they will be able to either cancel their pass or say they have arrived at their location. this will update on the admin portal side too and show whether students have active passes or if they have arrived at their destination or cancelled the pass.

## notes


- student ids are 6 digit numbers
- every pass requires a partner (buddy system)
- localstorage is used to keep inputs same content across reloads and to track active passes on the student side
