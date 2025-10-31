#!/bin/sh

# Generate config.js from environment variable
cat > /usr/share/nginx/html/assets/config.js << EOF
window.config = {
  apiUrl: '${API_URL}'
};
EOF

echo "Generated config.js with API URL: ${API_URL}"

# Start nginx
exec nginx -g "daemon off;"