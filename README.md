# Life Dashboard & Productivity Hub

A modern, full-stack web application designed for personal daily planning, task tracking, and productivity analytics with gamification elements. Built with **.NET 8 Web API**, **Angular 17+**, and **PostgreSQL**.

---

## Project Overview

**Life Dashboard** is a comprehensive task and life management system. Unlike traditional, overly complex task managers, this app focuses on a streamlined 3-day view (*Yesterday, Today, Tomorrow*) to minimize overwhelm and maximize daily consistency.

The application tracks task completion, monitors task procrastination (rescheduling history), and rewards users through a custom point-based gamification system.

---

## Core Features (Minimum Viable Product)

### 1. Daily Planning & Interactive Dashboard
* **3-Day View (Default):** Displays tasks split into three clear columns: *Yesterday*, *Today*, and *Tomorrow*.
* **Weekly Calendar View:** Alternative overview for broader weekly planning.
* **Quick Task Addition:** Intuitive modal/form right under the daily columns to quickly capture incoming tasks.
* **Daily Prompt / Check-in:** Interactive morning check-in asking: *"What are your plans for today?"*

### 2. Advanced Task & Procrastination Management
* **Task Attributes:** Title, Description, Priority (*Low, Medium, High, Critical*), Estimated Duration, and Categories/Tags.
* **Reschedule / Snooze Tracker:**
  * Tasks can be shifted to a future date.
  * Automatic tracking of how many times a task has been postponed (displays a badge e.g., `Rescheduled 3x`).
  * Full audit log of task date changes to analyze personal procrastination habits.
* **Task Statuses:** `To-Do`, `In Progress`, `Done`, `Cancelled`, `Rescheduled`.

### 3. Gamification & Point System
* Users earn points for completing tasks based on task **priority** and **punctuality**.
* Bonus points for completing tasks on time without rescheduling.
* Penalties or reduced rewards for tasks postponed multiple times.

### 4. Analytics & Productivity Insights
* **Completion Rate:** Weekly and monthly success metrics (% of completed vs. abandoned tasks).
* **Procrastination Analysis:** Identifies categories or task types that are most frequently delayed.
* **Priority Distribution:** Visual breakdown of completed workload by importance level.

---

## Tech Stack & Architecture

### **Backend**
* **Framework:** .NET 8 (ASP.NET Core Web API)
* **ORM:** Entity Framework Core
* **Database:** PostgreSQL / MS SQL Server
* **Authentication:** JWT (JSON Web Tokens)
* **Background Tasks / Reminders:** Quartz.NET / Hangfire

### **Frontend**
* **Framework:** Angular 17+ (Standalone Components, RxJS)
* **UI & Styling:** Modern Responsive Web Design (Tailwind CSS / Angular Material)
* **Data Visualization:** Chart.js / Ngx-charts

### **DevOps & Tools**
* **Containerization:** Docker & Docker Compose
* **Version Control:** Git / GitHub

---

## Future Expansion (Modules Pipeline)

The system is designed with a modular architecture to seamlessly integrate additional modules in subsequent phases:
* **Workout & Fitness Tracker:** Log workouts, exercises, sets, reps, and track strength progression.
* **Nutrition & Meal Planner:** Recipe fetching via external APIs, daily calorie/macro logging, and goal tracking (powered by a dedicated Python/FastAPI microservice).
* **Sleep & Habit Tracking:** Log sleep quality, wake times, and daily habits.


---
*Created as part of an engineering journey transitioning into .NET Core and Angular enterprise application development.*