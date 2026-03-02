# deca-pi
DECA Performance Indicator SQL Database
Project Overview

This project is a lightweight SQL backed study system designed to organize and practice curriculum content identified by structured codes such as EC:010 or EI:006. The system stores two main types of content: competency descriptions and multiple choice questions. Each item is indexed by a two letter domain code and a three digit objective number, allowing practice by domain such as EC or by full objective such as EC010. The interface is intentionally minimal and focused, similar in flow to Anki, but visually simple with only two or three colors and no scrolling or animations.

Purpose

The goal is to solve three core problems.
First, normalize and store approximately 600 competency descriptions in a consistent structured format.
Second, store approximately 3000 related multiple choice questions and link them to their correct objective codes.
Third, allow fast filtered practice sessions by two letter code or full five character code without distraction.

Data Structure and Parsing

Raw input consists of two formats.

Competency format example
Identify factors affecting a business’s profit EC:010
Followed by a descriptive paragraph explaining the competency.

Question format example
A question stem followed by answer choices labeled A through D
The correct answer indicated numerically
An explanation
One or more SOURCE lines containing the code such as EI:006

The system will parse each item and extract
Two letter code such as EC or EI
Three digit number such as 010 or 006
Full code stored as EC010 or EI006
Question text
Answer choices
Correct answer
Explanation
Source title if available

Database Design

The database will use a relational structure.

Table domains
id primary key
code two letters such as EC
description optional longer text

Table objectives
id primary key
domain_id foreign key
number three digit number stored as integer
full_code stored as text such as EC010
title short competency title
description full paragraph description

Table questions
id primary key
objective_id foreign key
question_text full stem
choice_a text
choice_b text
choice_c text
choice_d text
correct_choice single character A B C or D
explanation text
source_reference text

Indexes will be created on domain code and full_code for fast filtering.

Practice Modes

The application supports three practice modes.

Domain mode
User selects a two letter domain such as EC.
The system pulls all questions where domain matches EC across all numbers.

Objective mode
User selects a specific five code such as EC010.
The system pulls only questions linked to that objective.

Mixed review mode
User selects multiple domains or objectives.
The system randomizes questions across them.

Session Logic

Each session loads a batch of questions into memory.
Questions are presented one at a time.
No scrolling is required because only one question and its four choices are visible at once.
After selecting an answer the system shows
Correct or incorrect indicator
Correct answer
Explanation
Source code reference

The user clicks Next to continue.

UI Design

The interface is intentionally minimal.

Background color neutral light gray or off white.
Primary text color dark charcoal.
Accent color muted blue or muted green used only for buttons and highlights.

No gradients, no shadows, no animation.
Single centered card layout.
Large readable font.
Four stacked answer buttons.
Clear feedback message area below answers.

Top of screen shows current filter such as Practicing EC or Practicing EC010.
Small progress indicator such as Question 4 of 25.

There is no scrolling. Long explanations are truncated with a fixed height container sized to comfortably fit the typical explanation length. If needed, explanations are limited to a predefined character count at import time to guarantee layout stability.

Import and Parsing Pipeline

A preprocessing script reads raw text files.
The script identifies competency headers by detecting patterns like two uppercase letters followed by colon and three digits.
It extracts and stores the code, title, and description.

For question blocks, the script
Detects answer choices by A B C D markers
Extracts the numeric correct answer and maps it to letter
Parses the SOURCE line to capture the objective code
Associates the question with the correct objective via full_code lookup

All parsed content is validated.
If a question references a code not yet in objectives, it is flagged for review.

Technology Stack

Backend can be built using a simple stack such as
SQLite for development and possibly PostgreSQL for scaling
A small API layer using Node.js with Express or Python with Flask

Frontend can be plain HTML, CSS, and minimal JavaScript without frameworks to maintain simplicity and speed.

Core SQL Capabilities

The database must efficiently support
Selecting all objectives within a domain
Selecting all questions within an objective
Random ordering of questions
Counting total questions per objective
Tracking user performance if expansion is desired

Optional Expansion

Future enhancements may include
User accounts
Spaced repetition scoring
Tracking accuracy by domain
Marking weak objectives
Exporting performance reports

Summary

This project is a structured exam practice system driven by standardized objective codes. It transforms loosely formatted curriculum and question banks into a normalized relational database. It enables fast filtering by two letter domain or full five character objective. The user experience is intentionally minimal and distraction free, presenting one question at a time with immediate feedback. The architecture prioritizes clean parsing, normalized SQL relationships, fast indexing, and a simple focused study interface.
