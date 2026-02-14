
# ❄️ Taakra — Snowy Competition Platform

### Full Product + Engineering Specification

---

## 1. Project Overview

**Taakra** is a full-stack web platform designed to help users discover, register, and manage competitions through a modern Snowy + Glassmorphism UI powered by AI recommendations and real-time communication.

Taakra is NOT a simple CRUD application.

It is built as a scalable startup-style MVP with:

* Role-based authentication
* Real-time chat
* AI-powered assistant
* Personalized recommendations
* Analytics dashboards
* Snow-themed interactive UI

---

## 2. Product Vision

Taakra transforms competition discovery into a snowstorm of opportunities.

Each competition is represented as a “snowflake”.

Trending competitions behave like blizzards.

Deadlines melt.

Users earn Snow Points.

This metaphor must be respected across UI.

---

## 3. Core Applications

### 3.1 Marketing Website

Public-facing site:

* Hero section with snowfall
* Featured competitions
* Platform statistics
* About Taakra
* Call-to-action buttons

Purpose: attract users.

---

### 3.2 User Application

Authenticated experience:

* Browse competitions
* Search + filter
* View details
* Register
* Dashboard
* Calendar view
* AI recommendations
* Chat support
* Gamification

---

### 3.3 Admin Dashboard

Restricted access:

* Competition CRUD
* Registration approval
* User management
* Analytics
* Support staff management

---

## 4. Authentication System

Supports:

* Email/password signup
* JWT authentication
* Google OAuth
* Role-based authorization

Roles:

* user
* admin
* support

Protected routes are enforced on both frontend and backend.

---

## 5. Competition System

Each competition contains:

* title
* description
* category
* deadline
* prize
* tags
* registration count
* status

Users can:

* Browse
* Filter
* Sort
* Register

Admins can:

* Create
* Edit
* Delete
* Publish

---

## 6. Registration System

Users register for competitions.

Registrations are stored separately.

Status:

* pending
* approved

Admins approve registrations.

User dashboard reflects registration status.

---

## 7. AI Layer

### 7.1 AI Chatbot

Available everywhere.

Users can ask:

* Competition suggestions
* Rules explanation
* Deadline queries

Uses OpenAI API.

System prompt:

“You are Taakra Snow Assistant. Help users professionally.”

---

### 7.2 AI Recommendation Engine

Based on:

* User interests
* Registration history
* Trending competitions
* Deadline urgency

Returns top 5 personalized competitions.

Displayed as:

“Recommended For You ❄️”

---

## 8. Real-Time Communication

Socket.io powered chat.

Users can contact admin/support.

Features:

* Typing indicator
* Online status
* Message persistence

Admins have chat panel.

---

## 9. Snow Theme + Gamification

Users earn Snow Points:

* Register: +10
* Complete: +20

Badges:

* Ice Starter
* Ice Master
* Snow Legend

UI elements:

* Snowfall animation
* Melting deadline effect
* Blizzard trending animation

Theme is defined in theme.js.

All UI components MUST use theme.js.

---

## 10. Calendar View

Competitions appear on calendar.

Clicking opens modal with details.

Used for planning.

---



## 13. Design Rules (IMPORTANT)

* Use theme.js for ALL colors
* All cards must use glassmorphism
* No hardcoded hex colors
* Snow metaphor respected
* Animations subtle
* Dark background always
* Rounded corners everywhere

---

## 14. Cursor Instructions

Cursor must:

* Follow theme.js strictly
* Never introduce random UI styles
* Maintain modular components
* Keep backend clean MVC
* Prefer reusable components
* Comment complex logic
* Avoid inline styling unless necessary

Cursor should behave as senior engineer.

---

## 15. Deployment

All components deployed separately.

Environment variables:

* JWT_SECRET
* DB_URI
* OPENAI_KEY

README must include setup steps.

---

