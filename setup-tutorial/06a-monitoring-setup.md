# Monitoring Setup: Prometheus + Grafana

This guide sets up comprehensive monitoring for your media server using Prometheus and Grafana.

**Note**: This can be deployed as a separate stack or integrated into the `arr-stack-vm`.

## Overview

Monitoring provides visibility into:
- **Service Health**: Are all containers running and healthy?
- **Resource Usage**: CPU, memory, disk usage trends
- **Performance**: Response times, request rates

### Technologies

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Node Exporter**: Host-level metrics
- **cAdvisor**: Container-level metrics

## Setup

Since we are using a Split VM architecture, you have two options:

1.  **Centralized Monitoring VM**: Create a third VM dedicated to monitoring.
2.  **Co-located Monitoring**: Run the monitoring stack on the `arr-stack-vm` (Easiest for starting).

### Option 2: Add to ARR Stack

SSH into the ARR VM:
```bash
incus exec arr-stack-vm -- bash
cd /home/debian
```

Edit `docker-compose.yml` to add Prometheus and Grafana services (see `06-arr-stack-vm.md` for context).

*(Refer to standard Prometheus/Grafana Docker Compose examples for detailed configuration)*.