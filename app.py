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
    cursor.execute(
        "INSERT INTO passes (student_id, partner_id, from_location, to_location, time_left) VALUES (?, ?, ?, ?, ?)",
        (student_id, partner_id, current_location, to_location, datetime.datetime.now().strftime("%d/%m/%Y-%H:%M:%S"))
    )
    conn.commit()
    conn.close()
    print("saved to db")
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True)
