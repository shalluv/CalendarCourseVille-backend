<h1 align="center">CalendarCourseVille's backend</h1>

This is the backend of the CalendarCourseVille project.

> Check out the [frontend](https://github.com/shalluv/comengess) of the project.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
- [How to contribute](#how-to-contribute)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (>= 10.16.0)
- [pnpm](https://pnpm.js.org/) (>= 4.0.0)

### Installing

1. Clone the repository

```bash
git clone https://github.com/shalluv/comengess-backend.git
```

2. Enter the project directory

```bash
cd comengess-backend
```

3. Install the dependencies

```bash
pnpm install
```

4. Run the project

```bash
pnpm start:dev
```

## How to contribute

1. Fork the repository
2. Create a branch with your feature: `git checkout -b my-feature`
3. Stage your changes: `git add .`
   - Don't forget to run `pnpm prettier:check` to ensure the code style
   - If you don't pass in the prettier check, run `pnpm prettier:write` to fix the code style
4. Commit your changes: `git commit -m 'feat: My new feature'`
5. Push to your branch: `git push origin my-feature`
6. Open a pull request
