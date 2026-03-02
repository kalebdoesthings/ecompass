#import libraries
from flask import Flask, render_template, request, jsonify
import sqlite3

import json
with open("students.json") as f:
    STUDENTS = json.load(f)
import datetime
import sys
sys.stdout.flush()


app = Flask(__name__)


#creates db if it does not exist
def init_db():
    conn = sqlite3.connect("passes.db", timeout=10)
    conn.execute("""CREATE TABLE IF NOT EXISTS passes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT, partner_id TEXT,
        from_location TEXT, to_location TEXT,
        time_left TEXT, time_arrived TEXT, status TEXT
    )""")
    conn.commit()
    conn.close()

init_db()



#shows homepage
@app.route("/")
def main():
    return render_template("index.html")

#shows admin portal
@app.route("/admin")
def admin():
    return render_template("admin.html")

#Route to allow js to req pass status change
@app.route("/change_pass_status/", methods=["POST"])
def change_pass_status():
    #req data from frontend
    data = request.get_json()
    student_id = data['student_id']
    new_status = data['new_status']
    
    
    if not data or 'student_id' not in data or 'new_status' not in data:
        return jsonify({"status": "error", "message": "Missing fields"})

    #makes sure status is valid
    if new_status not in ("Arrived", "Cancelled"):
        return jsonify({"status": "error", "message": "Invalid status"})
    #updates data in db
    conn = sqlite3.connect("passes.db", timeout=10)
    cursor = conn.cursor()
    cursor.execute("UPDATE passes SET status = ? WHERE student_id = ? AND status = 'Active'", (new_status, student_id))
    if new_status == "Arrived":
            current_time = datetime.datetime.now().strftime("%d/%m/%Y-%H:%M:%S")
            cursor.execute("UPDATE passes SET time_arrived = ? WHERE student_id = ? AND status = ?", (current_time, student_id, new_status))

    conn.commit()
    conn.close()
    #returns status to frontend
    return jsonify({"status": "ok"})



#allows fetching of active passes with student id
@app.route("/active_pass/<student_id>")
def active_pass(student_id):
    #connects to db and searches for all active passes
    conn = sqlite3.connect("passes.db", timeout=10)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM passes WHERE student_id = ? AND status = 'Active'", (student_id,))
    row = cursor.fetchone()
    conn.close()
    #parses active pass and changes ids into names
    if row:
        row = list(row)
        row[1] = STUDENTS.get(row[1], row[1])
        row[2] = STUDENTS.get(row[2], row[2])
        return jsonify({"status": "ok", "pass": row})
    return jsonify({"status": "none"})





#fetches all passes
@app.route("/fetchpasses")
def fetchpasses():
    #connects to db and searches for all passes
    conn = sqlite3.connect("passes.db", timeout=10)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM passes ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    parsedrow = []
    #parses active pass and changes ids into names
    for row in rows:
        row = list(row)
        row[1] = STUDENTS.get(row[1], row[1])
        row[2] = STUDENTS.get(row[2], row[2])
        parsedrow.append(row)
        
    return jsonify(parsedrow)

#takes in data from user and makes sure everything is good
@app.route("/submit", methods=["POST"])
def submit():
    #receives data from frontend
    data = request.get_json()

    student_id = data['student_id']
    partner_id = data['partner_id']
    if student_id == partner_id:
        return jsonify({"status": "error", "message": "You can't be your own partner"})

    

    #error handling
    if student_id not in STUDENTS:
        return jsonify({"status": "error", "message": "Student ID not found"}), 400
    if partner_id not in STUDENTS:
        return jsonify({"status": "error", "message": "Partner ID not found"}), 400
    

    current_location = data['where_am_i_at']
    to_location = data['where_am_i_going']
    #connects to db and checks if ids are already registered under a pass and if they arent it submits a pass
    conn = sqlite3.connect("passes.db", timeout=10)
    cursor = conn.cursor()
    #check to see if id is registered under a pass
    cursor.execute("SELECT id FROM passes WHERE student_id = ? AND status = 'Active'", (student_id,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"status": "error", "message": "You already have an active pass"}), 400
    #checks if partner is under a pass too
    cursor.execute("SELECT * FROM passes WHERE student_id = ? AND status = 'Active'", (partner_id,))
    if cursor.fetchone():
        return jsonify({"status": "error", "message": "Partner already has an active pass"})

    #submits pass with the data provided from frontend
    cursor.execute(
    "INSERT INTO passes (student_id, partner_id, from_location, to_location, time_left, status) VALUES (?, ?, ?, ?, ?, ?)",
    (student_id, partner_id, current_location, to_location, datetime.datetime.now().strftime("%d/%m/%Y-%H:%M:%S"), "Active")
    )   
    conn.commit()
    conn.close()
    
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(port=5431)
