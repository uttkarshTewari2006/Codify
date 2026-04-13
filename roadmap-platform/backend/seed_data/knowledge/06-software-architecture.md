# Software Architecture

## Overview
Software architecture is the long-term structure of a codebase and the decisions that shape maintainability, flexibility, and team velocity. roadmap.sh’s software design and architecture roadmap is dedicated to learning these design and architecture principles. [web:24]

## Architectural responsibility
Architecture is about deciding how parts of a system fit together, which boundaries matter, and which tradeoffs are acceptable. The goal is not abstract purity; the goal is to make the system easier to change without breaking it.

## Core styles
Learn monoliths, modular monoliths, microservices, service-oriented architecture, and serverless systems. Each style shifts complexity between code structure, deployment, data ownership, and operational overhead.

## Design principles
Study separation of concerns, high cohesion, low coupling, dependency inversion, encapsulation, and clear module boundaries. These principles make codebases easier to reason about and easier to test.

## Patterns and communication
Understand common patterns such as layered architecture, hexagonal architecture, clean architecture, CQRS, event sourcing, and domain-driven design. roadmap.sh’s backend roadmap explicitly references architecture topics such as monolithic, microservices, SOA, serverless, CQRS, DDD, and event sourcing. [web:1]

## Evolution over time
Good architecture changes as a system grows. Learn how to move from a simple monolith to a more modular design, when to split services, and when not to.

## Contracts and integration
Architecture depends on stable contracts between components, such as interfaces, APIs, message schemas, and event definitions. Breaking changes become expensive when these contracts are unclear.

## Quality attributes
Assess architecture against maintainability, scalability, reliability, security, deployability, and observability. Good architecture is the structure that best satisfies the dominant constraints of the product.

## Decision making
Write architecture decisions down using lightweight records. Tradeoff clarity matters more than trying to find a perfect theoretical model.

## Milestones
1. Refactor a small app into clear modules.
2. Introduce boundaries and interfaces.
3. Experiment with events or CQRS in one slice.
4. Evaluate monolith versus microservices for a real product.
5. Document architectural decisions and tradeoffs.
