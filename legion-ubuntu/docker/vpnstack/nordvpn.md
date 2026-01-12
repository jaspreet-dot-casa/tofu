
For wireguard VPN setup using NordVPN, follow the instructions here:
https://gist.github.com/bluewalk/7b3db071c488c82c604baf76a42eaad3?permalink_comment_id=5075473#gistcomment-5075473

Basically, what I did is:
```bash
SERVER_INFO=$(curl -s "https://api.nordvpn.com/v1/servers/recommendations?filters\[servers_technologies\]\[identifier\]=wireguard_udp&limit=1")
HOSTNAME=$(echo $SERVER_INFO | jq -r '.[0].hostname')
PUBLIC_KEY=$(echo $SERVER_INFO | jq -r '.[0].technologies[] | select(.identifier == "wireguard_udp").metadata[] | select(.name == "public_key").value')
ENDPOINT=$(echo $SERVER_INFO | jq -r '.[0].station')

echo "Hostname: $HOSTNAME"
echo "Public Key: $PUBLIC_KEY"
echo "Endpoint: $ENDPOINT"
```

Go to https://my.nordaccount.com/dashboard/nordvpn/access-tokens/ to get your WireGuard accesss token.

Then get your WireGuard private key from the access token.
```bash
ACCESS_TOKEN="<ACCESS_TOKEN>"
PRIVATE_KEY=$(curl -s -u token:$ACCESS_TOKEN https://api.nordvpn.com/v1/users/services/credentials | jq -r .nordlynx_private_key)
echo "Private Key: $PRIVATE_KEY"
echo "Endpoint: $ENDPOINT"
```
