FROM alpine:latest

RUN apk add --no-cache curl tzdata

# Set timezone to Vietnam
ENV TZ=Asia/Ho_Chi_Minh

# Create scripts directory
RUN mkdir -p /scripts

# Copy files
COPY scripts/trigger.sh /scripts/trigger.sh
COPY crontab /etc/crontabs/root

# Make script executable
RUN chmod +x /scripts/trigger.sh

# Run cron in foreground with logging
CMD ["crond", "-f", "-d", "8"]
