<div align="center">

# 🃏 MetaNav
### Personal Productivity Organizer

**A single-user productivity workspace inspired by the bold, graphic interface language of Persona 5 Royal.**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=171717)
![Storage](https://img.shields.io/badge/Storage-localStorage-6B7280?style=for-the-badge)

</div>

## Overview

MetaNav is a personal, single-user organizer built as a browser-based SPA. It brings daily tasks, calendar planning, focus sessions, productivity statistics, and preferences into one workspace. State is persisted locally in the browser through `localStorage`; the architecture document describes the planned screens and data flow.

## Main areas

| Area | Purpose |
|---|---|
| Dashboard | Daily overview, pending tasks, completed work, and focus sessions |
| Task board | Kanban-style task organization and priorities |
| Calendar | Monthly view for planning |
| Focus | Pomodoro timer |
| Statistics | Productivity progress visualization |
| Settings | Theme and productivity-method preferences |

## Visual direction

The interface uses a bold red, black, white, and gold palette, comic-inspired borders, and solid surfaces. The project documentation describes two visual modes and a typography direction inspired by the source concept.

## Run locally

No build step is documented. Open `index.html` through a local static web server or a browser environment that supports the app's local assets.

```bash
git clone https://github.com/Alter-09/MetaNav.git
cd MetaNav
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Documentation

- [Architecture and design system](arquitectura.md)
- [Project planning and original case context](planificación.md)

---

<div align="center">

*Plan with intention. Focus on one mission at a time.*

</div>
