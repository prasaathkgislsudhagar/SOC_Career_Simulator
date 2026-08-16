#!/usr/bin/env python3
"""
export_users.py - Export users.xlsx to CSV, JSON, or Print Formatted Table
Usage:
  python3 scripts/export_users.py          # View formatted table in terminal
  python3 scripts/export_users.py --csv    # Exports to data/users.csv
  python3 scripts/export_users.py --json   # Exports to data/users.json
"""
import os
import sys
import json
import csv
import openpyxl

EXCEL_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'users.xlsx')
DATA_DIR = os.path.dirname(EXCEL_FILE)

def load_data():
    if not os.path.exists(EXCEL_FILE):
        print(f"Error: {EXCEL_FILE} not found.")
        sys.exit(1)
    wb = openpyxl.load_workbook(EXCEL_FILE, data_only=True)
    ws = wb['Users']
    rows = list(ws.iter_rows(values_only=True))
    headers = list(rows[0])
    data = [dict(zip(headers, row)) for row in rows[1:] if row and any(row)]
    return headers, data, rows

def export_csv():
    _, _, rows = load_data()
    csv_file = os.path.join(DATA_DIR, 'users.csv')
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    print(f"✅ Exported CSV to: {csv_file}")

def export_json():
    _, data, _ = load_data()
    json_file = os.path.join(DATA_DIR, 'users.json')
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print(f"✅ Exported JSON to: {json_file}")

def print_table():
    headers, data, _ = load_data()
    print("\n" + "=" * 110)
    print(f"📊 SOC USER REGISTRATION DATABASE ({len(data)} Users Registered)")
    print("=" * 110)
    
    col_widths = {
        'User ID': 12,
        'Username / Call-Sign': 18,
        'Email': 28,
        'Experience Level': 25,
        'College / Organization': 24,
        'Account Status': 14
    }
    
    header_str = " | ".join(f"{h:<{col_widths.get(h, 15)}}" for h in col_widths.keys())
    print(header_str)
    print("-" * 110)
    
    for u in data:
        row_str = " | ".join(f"{str(u.get(h, '')):<{col_widths.get(h, 15)}}" for h in col_widths.keys())
        print(row_str)
    print("=" * 110 + "\n")

if __name__ == '__main__':
    if '--csv' in sys.argv:
        export_csv()
    elif '--json' in sys.argv:
        export_json()
    else:
        print_table()
