# 🧠 Multi-Agent Orchestrator System

## **Email Agent • Google Drive/Sheets Agent • General Agent • Guardrails • MCP Tools**

This project is a **unified AI productivity system** built using the **OpenAI Workflow Builder**.
It uses an **Orchestrator Agent** that receives a user query, classifies the intent, applies guardrails, and routes the task to the correct specialized agent.

---

## 🚀 Features

### ✔ **Main Orchestrator Agent**

* Central brain of the system
* Reads user query
* Passes it through **Guardrails**
* Sends it to the **Classifier**
* Routes to the correct agent

---

### ✔ **Guardrails**

* Ensures safety, correctness, and clean inputs
* Stops harmful or unsafe tasks
* “Pass” = Continue
* “Fail” = Safety Response

---

### ✔ **Classifier (Few-shot Prompting)**

The classifier sorts user queries into 3 categories:

| Category           | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `send_email`       | When user wants to send/draft an email               |
| `google_drive`     | When user wants to read/write Google Sheets or files |
| `general_question` | Any general query that doesn't use tools             |

---

### ✔ **Routing (If / Else Logic)**

After classification, the workflow routes the user request to:

* **EmailAgent** → Gmail MCP tool
* **Google Drive Agent** → Google Sheets read/write tool
* **GeneralAgent** → Answers normal questions
* **Safety Response** → When guardrails fail

---

### ✔ **Email Agent**

Uses the **Gmail MCP Tool** to:

* Draft emails
* Send emails
* Format or rewrite email content

Inputs it handles:

``
to:
subject:
body:
`

---

### ✔ **Google Drive Agent**

Uses **Google Sheets MCP Tool** to:

* Read data from a sheet
* Write/update rows
* Modify values

Inputs it handles:

``
sheet_id:
range:
values:
``

---

### ✔ **General Agent**

Handles:

* Normal questions
* AI explanations
* Summaries
* Anything not requiring tools

---

## 🧩 System Architecture

``
User Query
     ↓
Guardrails
     ↓ Pass
Classifier (send_email / google_drive / general)
     ↓
  If / Else Router
     ├── EmailAgent (Gmail MCP)
     ├── Google Drive Agent (Sheets MCP)
     └── GeneralAgent
``

---

## 📌 MCP Tools Used

### **1. Gmail MCP Tool**

Handles email sending and drafting.

### **2. Google Sheets MCP Tool**

Handles:

* Reading ranges
* Writing to sheets

---

## 🛠 Tools Required

* OpenAI GPT-4.1 / GPT-4.1-mini
* Gmail MCP tool
* Google Sheets MCP tool
* Workflow Builder
* MCP server running locally or deployed

---

## 📦 Setup Instructions

### 1️⃣ Clone MCP Tools

``
git clone https://github.com/openai/mcp.git
cd mcp/tools/gmail
npm install
node server.js
``

Same for Google Sheets tool.

---

### 2️⃣ Connect Tools in Workflow Builder

* Add **MCP Tool Node**
* Add Gmail + Sheets tool connections
* Link nodes to EmailAgent and Google Drive Agent

---

### 3️⃣ Build Agents

* Main Orchestrator
* EmailAgent
* Google Drive Agent
* GeneralAgent
* Safety Response Agent

---

### 4️⃣ Add If/Else Logic

Conditions:

``
send_email → EmailAgent
google_drive → Google Drive Agent
general_question → GeneralAgent
``

---

## 🧪 Example User Inputs

### 📧 Email Example

``
Send an email to John:
Subject: Meeting Update
Body: Our meeting is rescheduled to 5 PM.
``

### 📄 Google Sheets Read Example

``
Read data from my attendance sheet A1:B20
``

### 📝 Google Sheets Write Example

``
Write my name Qasim in row 3 column 1
``

### ❓ General Question

``
Explain what a neural network is.
``

---

## 🎉 Final Result

You now have a **production-level multi-agent system** that can:

* Answer general questions
* Read/write Google Sheets
* Send emails
* Make decisions automatically
* Enforce safety with guardrails

All inside a no-code visual workflow!

---
