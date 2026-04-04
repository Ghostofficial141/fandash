#!/usr/bin/env python3
"""
Bank Statement Expense Classifier for Fandash
----------------------------------------------
Parses Indian bank statements (CSV/text) with UPI, NEFT, IMPS, and other
transaction types. Classifies each expense into a category and outputs
a clean CSV that the Fandash dashboard can directly consume.

Usage:
  python classify_statement.py <input_file> [--output <output_file>]
  python classify_statement.py --generate-sample
"""

import csv
import re
import sys
import os
import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict

# ─────────────────────────────────────────────
# Category Classification Rules
# ─────────────────────────────────────────────

CATEGORY_KEYWORDS = {
    "Food & Grocery": [
        "swiggy", "zomato", "uber eats", "dominos", "pizza", "mcdonald",
        "starbucks", "dunkin", "grocery", "restaurant", "cafe", "diner",
        "bakery", "food", "kitchen", "burger", "taco", "sushi",
        "chipotle", "wendys", "subway", "kfc", "popeyes", "panera",
        "big bazaar", "dmart", "reliance fresh", "grofers", "bigbasket",
        "blinkit", "zepto", "instamart", "jiomart", "spencers",
        "more supermarket", "nature basket", "freshtoho", "eatfit",
        "faasos", "box8", "behrouz", "biryani", "chai", "tea",
        "coffee", "ice cream", "sweet", "meat", "fish", "chicken",
        "milk", "dairy", "bread", "fruit", "vegetable", "kirana",
    ],
    "Transportation": [
        "uber", "lyft", "ola", "rapido", "metro", "transit", "bus",
        "train", "railway", "irctc", "gas station", "parking", "toll",
        "fuel", "petrol", "diesel", "ev charging", "fastag", "nhai",
        "auto", "cab", "taxi", "rickshaw", "yulu", "bounce", "vogo",
        "bluSmart", "meru", "indian oil", "hp petrol", "bharat petroleum",
        "iocl", "bpcl", "hpcl",
    ],
    "Entertainment": [
        "netflix", "spotify", "disney", "hotstar", "prime video",
        "apple tv", "youtube", "twitch", "cinema", "movie", "theater",
        "pvr", "inox", "gaming", "steam", "playstation", "xbox",
        "bookmyshow", "event", "park", "concert", "ticket",
        "jio cinema", "zee5", "sonyliv", "voot", "alt balaji",
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "ebay", "ajio", "meesho",
        "tatacliq", "nykaa", "purplle", "lenskart", "croma",
        "vijay sales", "reliance digital", "mall", "shop", "store",
        "market", "purchase", "retail", "nike", "adidas", "zara",
        "h&m", "puma", "decathlon", "lifestyle", "shoppers stop",
        "pantaloons", "westside", "max fashion",
    ],
    "Bills & Utilities": [
        "electric", "water", "gas bill", "internet", "wifi", "broadband",
        "phone bill", "mobile recharge", "airtel", "jio", "vodafone",
        "vi ", "bsnl", "tata sky", "dish tv", "d2h", "insurance",
        "utility", "sewage", "trash", "waste", "bescom", "msedcl",
        "tata power", "adani electricity", "torrent power", "lic",
        "prepaid", "postpaid", "dth",
    ],
    "Healthcare": [
        "pharmacy", "hospital", "clinic", "doctor", "dental", "medical",
        "health", "drug", "prescription", "medplus", "apollo",
        "practo", "lab", "diagnostic", "optician", "eye", "1mg",
        "pharmeasy", "netmeds", "medlife", "max hospital", "fortis",
        "manipal", "narayana",
    ],
    "Subscriptions": [
        "subscription", "membership", "patreon", "notion", "slack",
        "zoom", "dropbox", "icloud", "google one", "microsoft 365",
        "adobe", "canva", "figma", "github", "chatgpt", "openai",
        "linkedin premium", "medium",
    ],
    "Education": [
        "udemy", "coursera", "skillshare", "school", "college",
        "university", "tuition", "books", "library", "education",
        "learning", "course", "byjus", "unacademy", "vedantu",
        "upgrad", "simplilearn", "great learning",
    ],
    "Travel": [
        "airline", "flight", "hotel", "airbnb", "booking.com",
        "expedia", "makemytrip", "goibibo", "cleartrip", "trivago",
        "resort", "travel", "vacation", "hostel", "oyo", "treebo",
        "yatra", "easemytrip", "ixigo",
    ],
    "Investment": [
        "invest", "mutual fund", "sip", "stock", "share", "zerodha",
        "groww", "upstox", "angel", "5paisa", "paytm money", "kuvera",
        "coin", "demat", "trading", "nps", "ppf", "gold", "sovereign",
    ],
    "UPI Transfer": [
        # This is a catch-all for person-to-person UPI transfers
    ],
}

# ─────────────────────────────────────────────
# UPI / NEFT / IMPS Pattern Extractors
# ─────────────────────────────────────────────

def extract_upi_payee(description: str) -> str:
    """Extract the payee name from a UPI transaction description."""
    desc = description.strip()

    # Pattern: UPI/CR/XXXXXXXXX/PAYEE NAME/...
    # or: WDLTFR  UPVDR/XXXXXXXXX/PAYEE/...
    # or: UPI-Name-upiid@bank-...
    
    # Try splitting by '/'
    parts = [p.strip() for p in desc.split("/") if p.strip()]
    
    # For UPI transactions, the payee is usually the 3rd or 4th segment
    # Format: TYPE/UPI_REF/DATE/ACCOUNT/PAYEE/...
    for part in parts:
        # Skip numeric-only parts (reference numbers, dates, amounts)
        if re.match(r'^[\d\.\-\s]+$', part):
            continue
        # Skip known prefixes
        if any(part.upper().startswith(prefix) for prefix in [
            'UPI', 'WDLTFR', 'DEPTFR', 'SOUTFR', 'SAMTRF', 'CR', 'DR',
            'AT', 'S2', 'UPVDR', 'UPVCN', 'NEFT', 'IMPS', 'RTGS',
            'BY TRANSFER', 'TOWER', 'CSN', 'RAMDAS',
        ]):
            continue
        # Skip parts that look like UPI IDs (contain @)
        if '@' in part:
            continue
        # Skip parts that match date patterns
        if re.match(r'^\d{2}[/\-]\d{2}[/\-]\d{2,4}', part):
            continue
        # Skip very short parts (likely codes)
        if len(part) < 3:
            continue
        # This is likely the payee name
        return part.strip()
    
    return desc[:50]  # fallback: first 50 chars of description


def extract_neft_payee(description: str) -> str:
    """Extract payee from NEFT/RTGS description."""
    parts = [p.strip() for p in description.split("/") if p.strip()]
    for part in parts:
        if re.match(r'^[\d\.\-\s]+$', part):
            continue
        if any(part.upper().startswith(prefix) for prefix in [
            'NEFT', 'RTGS', 'N', 'R', 'IDIB', 'SBIN', 'HDFC', 'ICIC',
            'UTIB', 'KKBK', 'BARB', 'PUNB', 'CNRB',
        ]):
            continue
        if len(part) < 3:
            continue
        return part.strip()
    return description[:50]


# ─────────────────────────────────────────────
# Main Classifier
# ─────────────────────────────────────────────

def classify_transaction(description: str, amount: float, tx_type: str) -> dict:
    """
    Classify a single transaction.
    Returns dict with: category, payee, confidence
    """
    if tx_type == "income":
        return {
            "category": "Income",
            "payee": extract_upi_payee(description),
            "confidence": "high",
        }

    lower = description.lower()
    
    # Check keyword-based categories
    for category, keywords in CATEGORY_KEYWORDS.items():
        if category == "UPI Transfer":
            continue  # handle this as fallback
        for kw in keywords:
            if kw in lower:
                return {
                    "category": category,
                    "payee": extract_upi_payee(description),
                    "confidence": "high",
                }
    
    # Check if it's a UPI person-to-person transfer
    if any(tag in lower for tag in ["upi", "upvdr", "upvcn"]):
        return {
            "category": "UPI Transfer",
            "payee": extract_upi_payee(description),
            "confidence": "medium",
        }
    
    # Check NEFT
    if any(tag in lower for tag in ["neft", "deptfr", "soutfr"]):
        return {
            "category": "Bank Transfer",
            "payee": extract_neft_payee(description),
            "confidence": "medium",
        }
    
    # ATM withdrawal
    if any(tag in lower for tag in ["atm", "cash withdrawal", "cwdr"]):
        return {
            "category": "Cash Withdrawal",
            "payee": "ATM",
            "confidence": "high",
        }
    
    # Fallback
    return {
        "category": "Other",
        "payee": extract_upi_payee(description),
        "confidence": "low",
    }


# ─────────────────────────────────────────────
# Statement Parser
# ─────────────────────────────────────────────

def parse_date(date_str: str) -> datetime:
    """Parse common Indian bank date formats."""
    date_str = date_str.strip()
    formats = [
        "%d/%m/%Y", "%d-%m-%Y", "%d/%m/%y", "%d-%m-%y",
        "%Y-%m-%d", "%Y/%m/%d",
        "%d %b %Y", "%d %B %Y",
        "%d/%m/%Y %H:%M", "%d-%m-%Y %H:%M",
        "%d/%m/%Y %H:%M:%S",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    # Last resort
    try:
        return datetime.fromisoformat(date_str)
    except:
        return datetime.now()


def parse_money(val: str) -> float:
    """Parse Indian currency values like '1,23,456.78' or '165.00'."""
    if not val or not val.strip():
        return 0.0
    cleaned = re.sub(r'[^\d.\-]', '', val.strip())
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def detect_csv_columns(headers: list) -> dict:
    """Detect column indices from headers."""
    mapping = {
        "date": None,
        "description": None,
        "debit": None,
        "credit": None,
        "amount": None,
        "balance": None,
    }
    
    date_keys = ["date", "txn date", "transaction date", "posting date", "value date"]
    desc_keys = ["description", "narration", "details", "particulars", "memo", "merchant", "payee", "name"]
    debit_keys = ["debit", "withdrawal", "dr", "amount debited", "debit amount"]
    credit_keys = ["credit", "deposit", "cr", "amount credited", "credit amount"]
    amount_keys = ["amount", "transaction amount", "txn amount"]
    balance_keys = ["balance", "closing balance", "running balance"]
    
    for i, h in enumerate(headers):
        hl = h.lower().strip()
        if mapping["date"] is None and any(k in hl for k in date_keys):
            mapping["date"] = i
        elif mapping["description"] is None and any(k in hl for k in desc_keys):
            mapping["description"] = i
        elif mapping["debit"] is None and any(k in hl for k in debit_keys):
            mapping["debit"] = i
        elif mapping["credit"] is None and any(k in hl for k in credit_keys):
            mapping["credit"] = i
        elif mapping["amount"] is None and any(k in hl for k in amount_keys):
            mapping["amount"] = i
        elif mapping["balance"] is None and any(k in hl for k in balance_keys):
            mapping["balance"] = i
    
    return mapping


def parse_csv_statement(filepath: str) -> list:
    """Parse a CSV bank statement file into a list of transaction dicts."""
    transactions = []
    
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        # Try to detect delimiter
        sample = f.read(2048)
        f.seek(0)
        
        # Detect delimiter
        if sample.count('\t') > sample.count(','):
            delimiter = '\t'
        else:
            delimiter = ','
        
        reader = csv.reader(f, delimiter=delimiter)
        rows = list(reader)
    
    if len(rows) < 2:
        raise ValueError("File has fewer than 2 rows. Expected header + data.")
    
    # Find header row (skip any metadata rows)
    header_idx = 0
    for i, row in enumerate(rows):
        joined = ' '.join(row).lower()
        if any(k in joined for k in ['date', 'debit', 'credit', 'description', 'narration', 'details']):
            header_idx = i
            break
    
    headers = [h.strip() for h in rows[header_idx]]
    col_map = detect_csv_columns(headers)
    
    if col_map["date"] is None:
        raise ValueError(f"Could not detect 'date' column in headers: {headers}")
    if col_map["description"] is None:
        raise ValueError(f"Could not detect 'description' column in headers: {headers}")
    
    for row in rows[header_idx + 1:]:
        if not row or len(row) <= max(v for v in col_map.values() if v is not None):
            continue
        
        date_str = row[col_map["date"]].strip() if col_map["date"] is not None else ""
        description = row[col_map["description"]].strip() if col_map["description"] is not None else ""
        
        if not date_str or not description:
            continue
        
        # Skip summary/total rows
        low_desc = description.lower()
        if any(x in low_desc for x in ["statement summary", "total debits", "total credits", "opening balance", "closing balance", "brought forward"]):
            continue
        
        date = parse_date(date_str)
        
        debit = 0.0
        credit = 0.0
        
        if col_map["debit"] is not None and col_map["credit"] is not None:
            debit = parse_money(row[col_map["debit"]] if col_map["debit"] < len(row) else "")
            credit = parse_money(row[col_map["credit"]] if col_map["credit"] < len(row) else "")
        elif col_map["amount"] is not None:
            amt = parse_money(row[col_map["amount"]])
            if amt < 0:
                debit = abs(amt)
            else:
                credit = amt
        
        if debit == 0 and credit == 0:
            continue
        
        tx_type = "income" if credit > 0 else "expense"
        amount = credit if credit > 0 else debit
        
        classification = classify_transaction(description, amount, tx_type)
        
        balance = 0.0
        if col_map["balance"] is not None and col_map["balance"] < len(row):
            balance = parse_money(row[col_map["balance"]])
        
        transactions.append({
            "date": date.strftime("%Y-%m-%d"),
            "description": description,
            "debit": debit,
            "credit": credit,
            "balance": balance,
            "type": tx_type,
            "amount": amount,
            "category": classification["category"],
            "payee": classification["payee"],
            "confidence": classification["confidence"],
        })
    
    return transactions


# ─────────────────────────────────────────────
# Output for Fandash Dashboard
# ─────────────────────────────────────────────

def generate_fandash_csv(transactions: list, output_path: str):
    """Write a clean CSV that Fandash's statementParser.js can read."""
    fieldnames = ["Date", "Description", "Debit", "Credit", "Balance"]
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for tx in transactions:
            writer.writerow({
                "Date": tx["date"],
                "Description": tx["payee"] if tx["payee"] else tx["description"],
                "Debit": f"{tx['debit']:.2f}" if tx["debit"] > 0 else "",
                "Credit": f"{tx['credit']:.2f}" if tx["credit"] > 0 else "",
                "Balance": f"{tx['balance']:.2f}" if tx["balance"] > 0 else "",
            })
    
    print(f"  ✅ Fandash-compatible CSV saved: {output_path}")


def generate_classified_csv(transactions: list, output_path: str):
    """Write a fully classified CSV with categories."""
    fieldnames = [
        "Date", "Payee", "Description", "Type", "Category",
        "Debit", "Credit", "Balance", "Confidence"
    ]
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for tx in transactions:
            writer.writerow({
                "Date": tx["date"],
                "Payee": tx["payee"],
                "Description": tx["description"][:80],
                "Type": tx["type"],
                "Category": tx["category"],
                "Debit": f"{tx['debit']:.2f}" if tx["debit"] > 0 else "",
                "Credit": f"{tx['credit']:.2f}" if tx["credit"] > 0 else "",
                "Balance": f"{tx['balance']:.2f}" if tx["balance"] > 0 else "",
                "Confidence": tx["confidence"],
            })
    
    print(f"  ✅ Classified CSV saved: {output_path}")


def generate_analytics_json(transactions: list, output_path: str):
    """Generate a JSON analytics file for direct import into Fandash."""
    total_expense = sum(tx["amount"] for tx in transactions if tx["type"] == "expense")
    total_income = sum(tx["amount"] for tx in transactions if tx["type"] == "income")
    
    # Category breakdown
    category_map = defaultdict(lambda: {"total": 0, "count": 0, "transactions": []})
    for tx in transactions:
        if tx["type"] == "expense":
            cat = tx["category"]
            category_map[cat]["total"] += tx["amount"]
            category_map[cat]["count"] += 1
            category_map[cat]["transactions"].append({
                "id": f"stmt-{len(category_map[cat]['transactions']):04d}",
                "type": tx["type"],
                "amount": tx["amount"],
                "category": tx["category"],
                "recipientName": tx["payee"],
                "status": "completed",
                "date": tx["date"],
            })
    
    category_breakdown = []
    for name, data in sorted(category_map.items(), key=lambda x: x[1]["total"], reverse=True):
        pct = round((data["total"] / total_expense * 100)) if total_expense > 0 else 0
        category_breakdown.append({
            "name": name,
            "total": round(data["total"], 2),
            "count": data["count"],
            "percentage": pct,
            "transactions": data["transactions"],
        })
    
    # Top merchants
    merchant_map = defaultdict(lambda: {"total": 0, "count": 0})
    for tx in transactions:
        if tx["type"] == "expense":
            merchant_map[tx["payee"]]["total"] += tx["amount"]
            merchant_map[tx["payee"]]["count"] += 1
    
    top_merchants = sorted(
        [{"name": k, "total": round(v["total"], 2), "count": v["count"]}
         for k, v in merchant_map.items()],
        key=lambda x: x["total"],
        reverse=True,
    )[:10]
    
    # Daily spending
    daily_map = defaultdict(float)
    for tx in transactions:
        if tx["type"] == "expense":
            daily_map[tx["date"]] += tx["amount"]
    daily_spending = sorted(
        [{"date": k, "total": round(v, 2)} for k, v in daily_map.items()],
        key=lambda x: x["date"],
    )
    
    # Build Fandash-compatible transactions
    fandash_transactions = []
    for i, tx in enumerate(transactions):
        fandash_transactions.append({
            "id": f"stmt-{i+1:04d}",
            "type": tx["type"],
            "amount": tx["amount"],
            "category": tx["category"],
            "recipientName": tx["payee"],
            "status": "completed",
            "date": tx["date"],
            "notes": f"[{tx['confidence']}] {tx['description'][:60]}",
            "createdAt": datetime.now().isoformat(),
        })
    
    dates = [tx["date"] for tx in transactions]
    
    analytics = {
        "transactions": fandash_transactions,
        "summary": {
            "totalExpense": round(total_expense, 2),
            "totalIncome": round(total_income, 2),
            "netFlow": round(total_income - total_expense, 2),
            "transactionCount": len(transactions),
            "dateRange": {
                "from": min(dates) if dates else None,
                "to": max(dates) if dates else None,
            },
        },
        "categoryBreakdown": category_breakdown,
        "topMerchants": top_merchants,
        "dailySpending": daily_spending,
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(analytics, f, indent=2, ensure_ascii=False)
    
    print(f"  ✅ Analytics JSON saved: {output_path}")
    return analytics


# ─────────────────────────────────────────────
# Generate sample from the provided bank stmt
# ─────────────────────────────────────────────

def generate_sample_from_bank_statement():
    """
    Generate a sample CSV from the bank statement shown in the screenshot.
    This is the actual data from the user's bank statement.
    """
    # Manually transcribed from the bank statement image
    # Date range: 01-04-2026 to 05-04-2026
    transactions_raw = [
        # Date, Details, Debit, Credit, Balance
        ("01/04/2026", "WDLTFR  UPVDR/605945888003/Neeraja ATESB/paymenl 009728/192004AT S3696 RAMDAS TOWER,CSN", "165.00", "", "8004.20"),
        ("01/04/2026", "WDLTFR UPVDR/645121704839/MOHAMMFDFED/YESBa 009728/192004AT S3696 RAMDAS TOWER,CSN", "", "", "7834.20"),
        ("01/04/2026", "S4/UPP  009728192004AT S3696 RAMDAS TOWER,CSN", "", "", ""),
        ("02/04/2026", "DEPTFR  UPVCR/645/198697/32/9FED AMSUBU/Ammar.ba 009773/84192001 AT S3696 RAMDAS TOWER,CSN", "", "95.00", "7929.20"),
        ("03/04/2026", "WDLTFR  UPVDR/605993004/58/VERCE S0UTFR/ercoso Ls/Paym  009780/25.2004 AT S3696/RAMDAS TOWER,CSN", "30.00", "", "7899.20"),
        ("03/04/2026", "WDLTFR  UPVDR/545072/24630/VERCE S0UTFR/ercoso Ls/Paym  009780/25.2004 AT S3696/RAMDAS TOWER,CSN", "30.00", "", "7869.20"),
        ("03/04/2026", "DEPTFR  UPVCN/233696/38/254/Aarun /SBIN/S*4898/ SMPaym  00977/34192.000 AT S3696 RAMDAS/TOWER,CSN", "", "1,290.09", "789.19"),
        ("03/04/2026", "DEPTFR  UPVCN/602/4402384/iOtunde SBIN/Madhankur a/UPP  009773/8192006AT S3696 RAMDAS TOWER,CSN", "425.00", "", "8234.39"),
        ("04/04/2026", "WDLTFR  UPVDR/580/38/7255/34/VERCE S0UTFR/ercoso Ls/Paym  009580/416.2002 AT S3696/RAMDAS TOWER,CSN", "10.00", "", "8204.39"),
        ("04/04/2026", "WDLTFR  UPVDR/609094/09/25/34/VERCE S0UTFR/ercoso Ls/Paym  009580/416.2002 AT S3696/RAMDAS TOWER,CSN", "75.00", "", "8520.39"),
        ("04/04/2026", "DEPTFR  UPVCR/12/94343/6.3/RAMALA /SBIN/8300048 S4/Paym 009778/590/07 AT S3696 RAMDAS/TOWER,CSN", "", "3,500", ""),
        ("04/04/2026", "DEPTFR  UPVCR/1200/17/20/27/SPARSH VIVCNFIRkhan/a 12/Vol  009778/8192007 AT S3696 RAMDAS TOWER,CSN", "", "300.00", "8459.19"),
        ("04/04/2026", "WDLTFR UPI/MDR 6003/363322/5/RARA/MULYES/Mag/254 TOWER,CSN", "", "", ""),
        ("05/04/2026", "83/UPP  009780/84192004AT S3696 RAMDAS TOWER,CSN", "", "", "8389.19"),
        ("05/04/2026", "DEPTFR  UPVCN/1/2/63845/63/C1/5FED AMSUBU/Ammar.ba eda/pal  009573/86/2001 AT S3696 TOWER,CSN", "", "190.00", "8579.19"),
        ("04/04/2026", "WDLTFR  UPVDR/602/848/33/06/94/VERCE S0UTFR/ercoso Ls/Paym 009380/416.2004 AT S3696/RAMDAS TOWER,CSN", "120.00", "", "8459.19"),
        ("04/04/2026", "DEPTFR  UPVCN/S/4463/897/436/4th.a Sa/S88vi/es/224947 Ls/Paym 009778/7/792006 AT S3696 RAMDAS/TOWER,CSN", "", "5,000", "8609.19"),
        ("05/04/2026", "WDLTFR  UPVDR/580/04/72/39/03/VERCE S0/Payment 85/0Paym  009780/816.2004 AT S3696 RAMDAS/TOWER,CSN", "", "", ""),
    ]
    
    # Clean up and create proper CSV
    csv_path = os.path.join(os.path.dirname(__file__), "..", "public", "bankStatement.csv")
    csv_path = os.path.normpath(csv_path)
    
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["Date", "Details", "Debit", "Credit", "Balance"])
        for row in transactions_raw:
            date, details, debit, credit, balance = row
            if debit or credit:  # Only include rows with actual amounts
                writer.writerow([date, details, debit, credit, balance])
    
    print(f"\n📊 Sample bank statement CSV generated: {csv_path}")
    return csv_path


# ─────────────────────────────────────────────
# Pretty Print Summary
# ─────────────────────────────────────────────

def print_summary(transactions: list):
    """Print a colorful summary of the classified transactions."""
    total_debit = sum(tx["debit"] for tx in transactions)
    total_credit = sum(tx["credit"] for tx in transactions)
    net = total_credit - total_debit
    
    print("\n" + "=" * 60)
    print("  💰 BANK STATEMENT ANALYSIS")
    print("=" * 60)
    
    if transactions:
        dates = [tx["date"] for tx in transactions]
        print(f"  📅 Period: {min(dates)} to {max(dates)}")
    
    print(f"  📊 Transactions: {len(transactions)}")
    print(f"  💸 Total Debits:  ₹{total_debit:,.2f}")
    print(f"  💚 Total Credits: ₹{total_credit:,.2f}")
    print(f"  {'🟢' if net >= 0 else '🔴'} Net Flow:     ₹{net:+,.2f}")
    
    print("\n" + "-" * 60)
    print("  📂 CATEGORY BREAKDOWN (Expenses)")
    print("-" * 60)
    
    category_totals = defaultdict(lambda: {"total": 0, "count": 0})
    for tx in transactions:
        if tx["type"] == "expense":
            category_totals[tx["category"]]["total"] += tx["amount"]
            category_totals[tx["category"]]["count"] += 1
    
    for cat, data in sorted(category_totals.items(), key=lambda x: x[1]["total"], reverse=True):
        pct = (data["total"] / total_debit * 100) if total_debit > 0 else 0
        bar = "█" * int(pct / 2)
        print(f"  {cat:22s} ₹{data['total']:>10,.2f} ({data['count']:2d}x) {bar} {pct:.0f}%")
    
    print("\n" + "-" * 60)
    print("  📋 TRANSACTION DETAILS")
    print("-" * 60)
    print(f"  {'Date':<12} {'Type':<8} {'Category':<18} {'Payee':<20} {'Amount':>10}")
    print("  " + "-" * 68)
    
    for tx in transactions:
        symbol = "+" if tx["type"] == "income" else "-"
        print(f"  {tx['date']:<12} {tx['type']:<8} {tx['category']:<18} {tx['payee'][:20]:<20} {symbol}₹{tx['amount']:>9,.2f}")
    
    print("\n" + "=" * 60)


# ─────────────────────────────────────────────
# CLI Entry Point
# ─────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("\nGenerating sample from bank statement...")
        sample_path = generate_sample_from_bank_statement()
        
        # Now parse and classify the generated sample
        print("\n🔍 Parsing and classifying transactions...")
        transactions = parse_csv_statement(sample_path)
        
        # Print summary
        print_summary(transactions)
        
        # Generate outputs
        output_dir = os.path.join(os.path.dirname(__file__), "..", "public")
        output_dir = os.path.normpath(output_dir)
        
        generate_fandash_csv(transactions, os.path.join(output_dir, "sampleStatement.csv"))
        generate_classified_csv(transactions, os.path.join(output_dir, "classifiedStatement.csv"))
        generate_analytics_json(transactions, os.path.join(output_dir, "statementAnalytics.json"))
        
        print("\n🎉 Done! Files are ready in the public/ folder.")
        print("   Upload sampleStatement.csv in the dashboard, or")
        print("   use any of your own bank statement CSVs.\n")
        return
    
    if sys.argv[1] == "--generate-sample":
        sample_path = generate_sample_from_bank_statement()
        transactions = parse_csv_statement(sample_path)
        print_summary(transactions)
        return
    
    input_file = sys.argv[1]
    if not os.path.isfile(input_file):
        print(f"❌ File not found: {input_file}")
        sys.exit(1)
    
    output_dir = os.path.dirname(input_file) or "."
    base_name = Path(input_file).stem
    
    # Parse custom --output flag
    output_prefix = os.path.join(output_dir, base_name)
    if "--output" in sys.argv:
        idx = sys.argv.index("--output")
        if idx + 1 < len(sys.argv):
            output_prefix = sys.argv[idx + 1]
    
    print(f"\n🔍 Parsing: {input_file}")
    transactions = parse_csv_statement(input_file)
    
    print_summary(transactions)
    
    # Generate all outputs
    generate_fandash_csv(transactions, f"{output_prefix}_fandash.csv")
    generate_classified_csv(transactions, f"{output_prefix}_classified.csv")
    generate_analytics_json(transactions, f"{output_prefix}_analytics.json")
    
    print(f"\n🎉 Done! {len(transactions)} transactions classified.\n")


if __name__ == "__main__":
    main()
