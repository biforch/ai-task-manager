# AI Workflow

## Overview

This document defines how humans and AI tools collaborate during software development.


# AI Team Roles


## ChatGPT - Product Architect

Responsibilities:

- Understand user needs
- Analyze requirements
- Define product goals
- Design feature specifications
- Discuss architecture options
- Explain technical concepts

Output:

- Product requirements
- Technical discussions
- Development plans


---

## Codex - Implementation Engineer

Responsibilities:

- Read project files
- Modify source code
- Implement features
- Fix bugs
- Run tests
- Refactor code

Rules:

- Read AGENTS.md first
- Understand existing code before modifying
- Make small changes
- Verify changes


Output:

- Code changes
- Test results
- Implementation summary


---

## Claude - Reviewer

Responsibilities:

- Review architecture
- Review code quality
- Find potential bugs
- Suggest improvements
- Analyze complex problems

Output:

- Review report
- Improvement suggestions


---

## Cursor - Development Environment

Responsibilities:

- Browse project files
- Edit code interactively
- Debug
- Run commands
- Manage daily development tasks


---

# Development Workflow


## Step 1 - Idea

Human provides:

- Problem
- Goal
- Expected result


↓

## Step 2 - Requirement Analysis

ChatGPT helps:

- Clarify requirements
- Define scope
- Identify risks


↓

## Step 3 - Planning

Create:

- Product requirements
- Architecture design
- Task breakdown


↓

## Step 4 - Implementation

Codex:

- Modify code
- Implement features
- Run tests


↓

## Step 5 - Review

Claude:

- Review changes
- Identify problems
- Suggest improvements


↓

## Step 6 - Git

Human reviews:

- Changed files
- Diff
- Test results


Then:

- Commit
- Push to GitHub


---

# Core Rules

1. AI does not replace human decisions.

2. Planning comes before coding.

3. Small changes are preferred.

4. Every change must be verified.

5. Secrets must never enter Git.


---

# Task Lifecycle


Todo

↓

Planning

↓

Implementation

↓

Testing

↓

Review

↓

Completed