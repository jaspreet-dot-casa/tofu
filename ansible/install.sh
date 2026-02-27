#!/usr/bin/env bash
# shellcheck disable=SC2155

set -euox pipefail
IFS=$'\n\t'

# The directory of this script
readonly script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# Default Ansible playbook
readonly playbook_file="${script_dir}/startup-playbook.yml"

# If playbook exists, execute it locally
if [[ -s "${playbook_file}" ]]; then
  ansible-playbook --connection=local "${playbook_file}"
fi
