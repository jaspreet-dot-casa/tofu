#!/bin/bash
# Validate prerequisites for OpenTofu + Terragrunt + Incus setup

set -e

echo "Validating prerequisites..."

# Check OpenTofu
if command -v tofu &> /dev/null; then
    echo "✓ OpenTofu: $(tofu version | head -n1)"
else
    echo "✗ OpenTofu not found. Please install OpenTofu."
    exit 1
fi

# Check Terragrunt
if command -v terragrunt &> /dev/null; then
    echo "✓ Terragrunt: $(terragrunt --version)"
else
    echo "✗ Terragrunt not found. Please install Terragrunt."
    exit 1
fi

# Check Incus
if command -v incus &> /dev/null; then
    echo "✓ Incus: $(incus version)"
else
    echo "✗ Incus not found. Please install Incus."
    exit 1
fi

# Check Incus daemon
if incus list &> /dev/null; then
    echo "✓ Incus daemon running"
else
    echo "✗ Incus daemon not accessible. Check permissions."
    exit 1
fi

# Check storage pools
if incus storage list | tail -n +4 | grep -q "^|"; then
    echo "✓ Incus storage configured ($(incus storage list --format csv | wc -l) pool(s) found)"
else
    echo "✗ Incus storage not configured. Run: incus admin init"
    exit 1
fi

# Check network
if incus network list | tail -n +4 | grep -q "^|"; then
    echo "✓ Incus network configured ($(incus network list --format csv | wc -l) network(s) found)"
else
    echo "✗ Incus network not configured. Run: incus admin init"
    exit 1
fi

echo ""
echo "All prerequisites validated! Ready to proceed."
