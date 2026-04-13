# System Design and Scalability

## Overview
System design is the process of creating a detailed blueprint of a system’s architecture, components, modules, interfaces, and data so it meets functional and non-functional requirements. roadmap.sh defines system design around scalability, performance, security, and usability, with attention to components such as load balancers, caches, queues, web servers, application servers, search engines, logging, monitoring, and scaling. [web:21]

## Requirements first
Start by separating functional requirements from non-functional requirements. This keeps designs grounded in real product needs such as latency, availability, throughput, data durability, and operational simplicity.

## Core building blocks
Learn the common primitives: clients, DNS, CDNs, load balancers, reverse proxies, app servers, databases, caches, message queues, object storage, search, and observability systems. Most system design questions are combinations of these same building blocks.

## Scalability patterns
Understand horizontal scaling, vertical scaling, sharding, partitioning, replication, consistent hashing, stateless services, and read/write separation. These concepts determine how a system grows without becoming fragile.

## Performance and latency
Study caching layers, indexes, batching, async processing, connection pooling, backpressure, and rate limiting. Good design makes the common path fast and the failure path safe.

## Reliability and resilience
Learn redundancy, failover, retries, circuit breakers, graceful degradation, and recovery strategies. Systems should degrade predictably instead of failing catastrophically.

## Data consistency
Explore tradeoffs between strong consistency, eventual consistency, transactions, distributed locks, and idempotent operations. There is no perfect choice; there is only a choice that fits the product requirements.

## Real-time systems
Understand WebSockets, pub/sub, event streams, and synchronization patterns for chat, collaboration, notifications, and live dashboards. These designs require careful thinking about ordering, state, and fan-out.

## Security in design
Bake in authentication, authorization, audit logging, least privilege, encrypted transport, and data protection. Security is a system property, not a feature bolted on at the end.

## Interview and production use
System design is used both for interviewing and for building real systems. roadmap.sh’s system design roadmap is intended as a structured blueprint for learning the concepts and patterns that appear across many systems. [web:21]

## Milestones
1. Learn the major infrastructure primitives.
2. Design a simple URL shortener or file-sharing service.
3. Add caches, queues, and scaling strategies.
4. Design a real-time or high-traffic system.
5. Practice tradeoff-based architecture explanations.
