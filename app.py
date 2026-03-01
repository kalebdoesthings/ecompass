from flask import Flask, render_template, request, jsonify
import sqlite3
import os
from util import STUDENTS
import datetime
import sys
sys.stdout.flush()
app = Flask(__name__)


@app.route("/")
def main():
    return render_template("index.html")

@app.route("/admin")
def admin():
    return render_template("admin.html")


@app.route("/change_pass_status/", methods=["POST"])
def change_pass_status():
    
    data = request.get_json()
    student_id = data['student_id']
    new_status = data['new_status']
    
    
    conn = sqlite3.connect("passes.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE passes SET status = ? WHERE student_id = ? AND status = 'Active'", (new_status, student_id))
    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})



@app.route("/active_pass/<student_id>")
def active_pass(student_id):
    conn = sqlite3.connect("passes.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM passes WHERE student_id = ? AND status = 'Active'", (student_id,))
    row = cursor.fetchone()
    conn.close()
    parsedrow = []
    if row:
        row = list(row)
        row[1] = STUDENTS.get(row[1], row[1])
        row[2] = STUDENTS.get(row[2], row[2])
        return jsonify({"status": "ok", "pass": row})
    return jsonify({"status": "none"})

@app.route("/fetchpasses")
def fetchpasses():
    conn = sqlite3.connect("passes.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM passes ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    parsedrow = []
    for row in rows:
        row = list(row)
        row[1] = STUDENTS.get(row[1], row[1])
        row[2] = STUDENTS.get(row[2], row[2])
        parsedrow.append(row)
        
    return jsonify(parsedrow)

#takes in data from user and makes sure everything is good
@app.route("/submit", methods=["POST"])
def submit():
    data = request.get_json()

    student_id = data['student_id']
    partner_id = data['partner_id']

    


    if student_id not in STUDENTS:
        return jsonify({"status": "error", "message": "Student ID not found"}), 400
    if partner_id not in STUDENTS:
        return jsonify({"status": "error", "message": "Partner ID not found"}), 400

    current_location = data['where_am_i_at']
    to_location = data['where_am_i_going']

    conn = sqlite3.connect("passes.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM passes WHERE student_id = ? AND status = 'Active'", (student_id,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"status": "error", "message": "You already have an active pass"}), 400
    cursor.execute(
    "INSERT INTO passes (student_id, partner_id, from_location, to_location, time_left, status) VALUES (?, ?, ?, ?, ?, ?)",
    (student_id, partner_id, current_location, to_location, datetime.datetime.now().strftime("%d/%m/%Y-%H:%M:%S"), "Active")
    )   
    conn.commit()
    conn.close()
    print("saved to db")
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True)
