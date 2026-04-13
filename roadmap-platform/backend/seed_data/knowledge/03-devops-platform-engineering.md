# DevOps and Platform Engineering

## Overview
DevOps is the practice of improving software delivery through automation, collaboration, monitoring, and infrastructure management. roadmap.sh describes DevOps as a field centered on Linux, scripting, networking, CI/CD, infrastructure as code, containers, orchestration, monitoring, secrets, GitOps, service mesh, and cloud platforms. [web:15]

## Operating systems and shell
Start with Linux fundamentals, the filesystem, permissions, processes, packages, services, and logs. Learn Bash, Vim or Nano, and basic PowerShell if you will work in mixed environments.

## Networking and security
Study DNS, HTTP, SSH, SSL/TLS, firewalls, ports, routing basics, and reverse proxies. These topics matter because many production problems are really networking problems in disguise.

## Web servers and reverse proxies
Learn Nginx and Apache, especially how they terminate TLS, serve static assets, proxy to application servers, and handle compression, caching, and headers.

## Infrastructure as code
Treat infrastructure like source code using Terraform, Ansible, Pulumi, or CloudFormation. roadmap.sh lists Terraform, Ansible, Pulumi, and CloudFormation as core DevOps tooling. [web:15]

## CI/CD
Learn how code moves from commit to test to deployment using systems such as GitHub Actions, Jenkins, GitLab CI, or CircleCI. Strong pipelines automate tests, builds, artifact creation, and safe rollout steps.

## Containers and orchestration
Understand Docker, Podman, Containerd, Kubernetes, and Docker Swarm. Start with images, layers, registries, and container networking, then move to pods, deployments, services, ingress, scaling, and rollouts.

## Observability
Learn logs, metrics, and traces using Prometheus, Grafana, ELK, and Loki. roadmap.sh includes Prometheus, Grafana, ELK Stack, and Loki in the DevOps roadmap, and these tools are essential for diagnosing incidents and performance regressions. [web:15]

## Secrets and delivery safety
Study Vault, Sealed Secrets, environment isolation, secret rotation, and access control. A healthy platform protects credentials while keeping deployments reproducible.

## GitOps and service mesh
Learn ArgoCD, FluxCD, Istio, and Consul to understand declarative operations, progressive delivery, and service-to-service communication at scale.

## Cloud platforms
Become comfortable with AWS, Azure, and Google Cloud Platform. Know the basic primitives: compute, networking, storage, IAM, managed databases, and observability integrations.

## DevOps versus SRE
DevOps primarily improves delivery speed, collaboration, and automation, while SRE emphasizes stability, resilience, SLOs, and incident response. roadmap.sh’s DevOps vs SRE article highlights differences in goals, metrics, team structure, and operational focus. [web:6]

## Milestones
1. Automate local development setup.
2. Build a CI pipeline for tests and deployment.
3. Containerize a service and run it on Kubernetes.
4. Add monitoring, logs, and alerting.
5. Add GitOps, secrets management, and cloud deployment.
