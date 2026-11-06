import { CloudEnvironmentInfo, CloudFile, RecentActivityItem } from "../types";

export const CLOUD_ENVIRONMENTS: CloudEnvironmentInfo[] = [
  {
    id: "aws-ec2",
    name: "AWS EC2",
    provider: "AWS",
    region: "us-east-1 (N. Virginia)",
    iconType: "ec2",
    description: "Elastic Compute Cloud instances running production microservices and core application workers.",
  },
  {
    id: "aws-lambda",
    name: "AWS Lambda",
    provider: "AWS",
    region: "us-west-2 (Oregon)",
    iconType: "lambda",
    description: "Serverless execution layer for event-driven workflows, API processing, and webhook listeners.",
  },
  {
    id: "aws-s3",
    name: "AWS S3",
    provider: "AWS",
    region: "us-east-2 (Ohio)",
    iconType: "s3",
    description: "Cloud object storage buckets storing access journals, backup snapshots, and archival dumps.",
  },
  {
    id: "azure-vm",
    name: "Azure Virtual Machines",
    provider: "Azure",
    region: "East US 2 (Virginia)",
    iconType: "azure",
    description: "Enterprise Windows & Linux host compute nodes managing distributed relational databases.",
  },
  {
    id: "gcp-compute",
    name: "Google Cloud Compute Engine",
    provider: "GCP",
    region: "us-central1 (Iowa)",
    iconType: "gcp",
    description: "Scalable virtual machine clusters handling real-time data ingestion pipelines and ML models.",
  },
  {
    id: "cloud-app-servers",
    name: "Cloud Application Servers",
    provider: "Hybrid Cloud",
    region: "Multi-Zone Dedicated",
    iconType: "server",
    description: "Kubernetes edge pods and reverse-proxy gateways servicing customer-facing HTTP web APIs.",
  },
];

export const INITIAL_FILES: CloudFile[] = [
  // 1. AWS EC2
  {
    id: "file-ec2-01",
    name: "ec2_system_auth.log",
    category: "log",
    type: "syslog",
    environmentId: "aws-ec2",
    environmentName: "AWS EC2",
    originalSizeBytes: 48500000, // 48.5 MB
    compressedSizeBytes: 12100000, // 12.1 MB (Saved 36.4 MB)
    uploadDate: "2026-09-05 14:22",
    status: "compressed",
    linesCount: 342000,
    sha256Original: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    sha256Compressed: "7a85b9860a2b0e9b9c9f7a627a8e5399581c7e29cbe2a50a1d4889c2fa7c8449",
    description: "SSH daemon authentication attempts, PAM security events, and privilege escalation records.",
    sampleContent: [
      "Sep 05 14:15:01 ec2-prod-worker-01 sshd[14201]: Accepted publickey for ec2-user from 10.0.14.82 port 52310 ssh2: RSA SHA256:4k9Hw2...",
      "Sep 05 14:15:02 ec2-prod-worker-01 sudo: ec2-user : TTY=pts/0 ; PWD=/home/ec2-user ; USER=root ; COMMAND=/usr/bin/systemctl status nginx",
      "Sep 05 14:15:10 ec2-prod-worker-01 sshd[14288]: Connection closed by authenticating user root 198.51.100.24 port 43210 [preauth]",
      "Sep 05 14:16:34 ec2-prod-worker-01 kernel: [48192.1029] audit: type=1100 audit(1725545794.120:84): pid=14302 uid=1000 auid=1000 ses=3",
      "Sep 05 14:17:00 ec2-prod-worker-01 CRON[14399]: (root) CMD (/usr/local/bin/log_rotate_check.sh >/dev/null 2>&1)",
      "Sep 05 14:18:12 ec2-prod-worker-01 systemd[1]: Started Daily apt upgrade and clean activities.",
    ],
  },
  {
    id: "file-ec2-02",
    name: "ec2_nginx_access.log",
    category: "log",
    type: "apache-access",
    environmentId: "aws-ec2",
    environmentName: "AWS EC2",
    originalSizeBytes: 82000000, // 82 MB
    compressedSizeBytes: 18400000, // 18.4 MB (Saved 63.6 MB)
    uploadDate: "2026-09-05 18:40",
    status: "compressed",
    linesCount: 520000,
    sha256Original: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    sha256Compressed: "4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    description: "Reverse proxy access records, edge routing latencies, and client IP query telemetry.",
    sampleContent: [
      '172.31.22.45 - - [05/Sep/2026:18:35:01 +0000] "GET /api/v2/telemetry/heartbeat HTTP/1.1" 200 48 "https://app.cloudoptima.io" "Go-http-client/1.1" 0.003',
      '172.31.22.46 - - [05/Sep/2026:18:35:02 +0000] "POST /api/v2/compression/jobs HTTP/1.1" 201 512 "https://app.cloudoptima.io" "Mozilla/5.0" 0.042',
      '192.168.10.12 - - [05/Sep/2026:18:35:04 +0000] "GET /healthz HTTP/1.1" 200 12 "-" "ELB-HealthChecker/2.0" 0.001',
      '172.31.22.88 - - [05/Sep/2026:18:35:05 +0000] "GET /static/chunks/dashboard.js HTTP/1.1" 304 0 "https://app.cloudoptima.io" "Mozilla/5.0" 0.008',
      '172.31.22.45 - - [05/Sep/2026:18:35:06 +0000] "GET /api/v2/environments/metrics HTTP/1.1" 200 1840 "https://app.cloudoptima.io" "Mozilla/5.0" 0.019',
    ],
  },
  {
    id: "file-ec2-03",
    name: "ec2_security_audit_events.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "aws-ec2",
    environmentName: "AWS EC2",
    originalSizeBytes: 34000000, // 34 MB
    compressedSizeBytes: 7800000, // 7.8 MB (Saved 26.2 MB)
    uploadDate: "2026-09-06 02:15",
    status: "compressed",
    linesCount: 198000,
    sha256Original: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    sha256Compressed: "2c624232cdd221771294dfbb310aca000a0df6ec8b66048419021878b20700d8",
    description: "Instance state changes, volume attachments, security group rule modifications, and SSH logins.",
    sampleContent: [
      '{"timestamp":"2026-09-06T02:10:00Z","actor":"iam:sec-automation","action":"ec2:AuthorizeSecurityGroupIngress","target":"sg-048291f0a","status":"SUCCESS","port":443}',
      '{"timestamp":"2026-09-06T02:11:15Z","actor":"iam:ci-deployer","action":"ec2:CreateSnapshot","target":"vol-09a82bcf1","status":"SUCCESS","sizeGB":250}',
      '{"timestamp":"2026-09-06T02:12:44Z","actor":"iam:admin-alex","action":"ec2:DescribeInstances","target":"i-08a9c2f102","status":"SUCCESS"}',
      '{"timestamp":"2026-09-06T02:14:02Z","actor":"iam:monitoring-agent","action":"ec2:GetMetricData","target":"CPUUtilization","status":"SUCCESS"}',
    ],
  },

  // 2. AWS Lambda
  {
    id: "file-lambda-01",
    name: "lambda_execution_stream.log",
    category: "log",
    type: "syslog",
    environmentId: "aws-lambda",
    environmentName: "AWS Lambda",
    originalSizeBytes: 56000000, // 56 MB
    compressedSizeBytes: 11200000, // 11.2 MB (Saved 44.8 MB)
    uploadDate: "2026-09-05 21:10",
    status: "compressed",
    linesCount: 410000,
    sha256Original: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    sha256Compressed: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    description: "CloudWatch runtime output for high-throughput stream ingestion and serverless webhook triggers.",
    sampleContent: [
      "2026-09-05T21:05:01.102Z START RequestId: 4f8812a0-9bc2-4f81-9b12-ca908bf12903 Version: $LATEST",
      "2026-09-05T21:05:01.115Z [INFO] Received payload event: { batchId: 'batch_9021', recordsCount: 150 }",
      "2026-09-05T21:05:01.189Z [INFO] Successfully compressed partition 4, reduction=74.2%",
      "2026-09-05T21:05:01.210Z END RequestId: 4f8812a0-9bc2-4f81-9b12-ca908bf12903",
      "2026-09-05T21:05:01.212Z REPORT RequestId: 4f8812a0 Duration: 108.42 ms Billed Duration: 109 ms Memory Size: 512 MB Max Memory Used: 142 MB",
    ],
  },
  {
    id: "file-lambda-02",
    name: "lambda_invocations_activity.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "aws-lambda",
    environmentName: "AWS Lambda",
    originalSizeBytes: 28000000, // 28 MB
    compressedSizeBytes: 6200000, // 6.2 MB (Saved 21.8 MB)
    uploadDate: "2026-09-06 01:45",
    status: "compressed",
    linesCount: 165000,
    sha256Original: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    sha256Compressed: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    description: "Serverless concurrency limits, provisioning concurrency changes, and dead-letter queue routing records.",
    sampleContent: [
      '{"timestamp":"2026-09-06T01:40:02Z","function":"fn-log-preprocessor","invocations":4210,"errors":0,"coldStarts":12,"throttles":0}',
      '{"timestamp":"2026-09-06T01:41:00Z","function":"fn-dedup-indexer","invocations":1890,"errors":0,"coldStarts":0,"throttles":0}',
      '{"timestamp":"2026-09-06T01:42:01Z","function":"fn-archive-shipper","invocations":940,"errors":0,"coldStarts":1,"throttles":0}',
    ],
  },
  {
    id: "file-lambda-03",
    name: "lambda_edge_router.log",
    category: "log",
    type: "syslog",
    environmentId: "aws-lambda",
    environmentName: "AWS Lambda",
    originalSizeBytes: 19500000, // 19.5 MB
    compressedSizeBytes: null, // Ready for compression!
    uploadDate: "2026-09-06 06:10",
    status: "uncompressed",
    linesCount: 128000,
    sha256Original: "3a52ce780950d4d969792a2559cd519d7ee8c727",
    description: "Lambda@Edge viewer request and response interception routing diagnostics.",
    sampleContent: [
      "2026-09-06T06:05:00.012Z START Lambda@Edge Viewer-Request URI: /static/v2/app.bundle.js",
      "2026-09-06T06:05:00.014Z [DEBUG] Origin selection evaluated: S3-Primary-Regional",
      "2026-09-06T06:05:00.018Z END Viewer-Request Latency: 6.2ms Status: 200",
    ],
  },

  // 3. AWS S3
  {
    id: "file-s3-01",
    name: "s3_bucket_access_records.log",
    category: "log",
    type: "cloudtrail",
    environmentId: "aws-s3",
    environmentName: "AWS S3",
    originalSizeBytes: 95000000, // 95 MB
    compressedSizeBytes: 19000000, // 19 MB (Saved 76 MB)
    uploadDate: "2026-09-05 09:30",
    status: "compressed",
    linesCount: 680000,
    sha256Original: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    sha256Compressed: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    description: "S3 Server Access Logs capturing REST API calls, bucket operations, and requester IP headers.",
    sampleContent: [
      '795f9392e1329d ec2-prod-worker [05/Sep/2026:09:28:01 +0000] 10.0.1.25 REST.GET.OBJECT logs/archive/2026-09.tar "GET /logs/archive HTTP/1.1" 200 - 4518290 45 42 "-" "aws-sdk-go/v2"',
      '795f9392e1329d data-syncer [05/Sep/2026:09:28:04 +0000] 10.0.2.19 REST.PUT.OBJECT telemetry/active_stream.json "PUT /telemetry HTTP/1.1" 200 - - 128 112 "-" "aws-cli/2.13"',
      '795f9392e1329d backup-bot [05/Sep/2026:09:28:10 +0000] 10.0.4.88 REST.HEAD.BUCKET - "HEAD / HTTP/1.1" 200 - - - 2 "-" "boto3/1.28"',
    ],
  },
  {
    id: "file-s3-02",
    name: "s3_cloudtrail_lifecycle_activity.json",
    category: "activity",
    type: "cloudtrail",
    environmentId: "aws-s3",
    environmentName: "AWS S3",
    originalSizeBytes: 42000000, // 42 MB
    compressedSizeBytes: 9500000, // 9.5 MB (Saved 32.5 MB)
    uploadDate: "2026-09-05 16:50",
    status: "compressed",
    linesCount: 235000,
    sha256Original: "e5a017130c61fb5c36a4be1500677120461f01ee319c3abd32b1095ad6d9fe1d",
    sha256Compressed: "256c9d2f254e007d4b4a1b07289f64f89d5a711467406a6cf4909a3cf6551b2a",
    description: "Bucket lifecycle transitions, Glacier Instant Retrieval migrations, and multipart upload aborts.",
    sampleContent: [
      '{"eventTime":"2026-09-05T16:45:00Z","eventName":"PutBucketLifecycleConfiguration","bucketName":"optima-enterprise-cold-storage","ruleCount":4}',
      '{"eventTime":"2026-09-05T16:46:12Z","eventName":"TransitionToGlacier","objectsMigrated":4290,"bytesSavedGB":120.4}',
      '{"eventTime":"2026-09-05T16:48:30Z","eventName":"AbortIncompleteMultipartUpload","cleanedUploads":18,"freedBytesMB":4800}',
    ],
  },
  {
    id: "file-s3-03",
    name: "s3_replication_audit.log",
    category: "log",
    type: "syslog",
    environmentId: "aws-s3",
    environmentName: "AWS S3",
    originalSizeBytes: 22800000, // 22.8 MB
    compressedSizeBytes: null, // Ready for compression!
    uploadDate: "2026-09-06 05:30",
    status: "uncompressed",
    linesCount: 140000,
    sha256Original: "7d1a54127b222502f5b79b5fb0803061152a44f92b3b",
    description: "Cross-region S3 bucket replication consistency telemetry between Ohio and Frankfurt.",
    sampleContent: [
      "2026-09-06T05:25:01Z [REPLICATION] Object s3://optima-us/v2/chunk_98.zst -> s3://optima-eu/v2/ replicated in 320ms",
      "2026-09-06T05:25:04Z [REPLICATION] Consistency checksum matched SHA-256 for chunk_98.zst",
    ],
  },

  // 4. Azure Virtual Machines
  {
    id: "file-azure-01",
    name: "azure_vm_syslog_daemon.log",
    category: "log",
    type: "syslog",
    environmentId: "azure-vm",
    environmentName: "Azure Virtual Machines",
    originalSizeBytes: 64000000, // 64 MB
    compressedSizeBytes: 14700000, // 14.7 MB (Saved 49.3 MB)
    uploadDate: "2026-09-05 11:15",
    status: "compressed",
    linesCount: 440000,
    sha256Original: "11a52708221b6d0c9f1396b281f62137e408d6d63ef2653ea9540b955dcb3947",
    sha256Compressed: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    description: "Azure Linux Agent (waagent) messages, systemd journal units, and kernel memory management.",
    sampleContent: [
      "Sep 05 11:10:01 az-vm-db-cluster-01 python3[892]: 2026/09/05 11:10:01.402 INFO ExtHandler Env ping status: healthy, tenantId: 4402",
      "Sep 05 11:10:05 az-vm-db-cluster-01 systemd[1]: postgresql@15-main.service: Checkpoint completed in 14.2s (840 MB written)",
      "Sep 05 11:10:12 az-vm-db-cluster-01 kernel: [38910.120] nf_conntrack: table full, dropping packet (12 dropped)",
      "Sep 05 11:11:00 az-vm-db-cluster-01 az_monitor_agent[1202]: Heartbeat sent to Azure Monitor Log Analytics workspace: 200 OK",
    ],
  },
  {
    id: "file-azure-02",
    name: "azure_activity_log_audit.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "azure-vm",
    environmentName: "Azure Virtual Machines",
    originalSizeBytes: 38000000, // 38 MB
    compressedSizeBytes: 8900000, // 8.9 MB (Saved 29.1 MB)
    uploadDate: "2026-09-05 23:05",
    status: "compressed",
    linesCount: 210000,
    sha256Original: "2e7d2c03a9507ae265ecf5b5356885a53393a2029d24139499ddf69f0d481ac2",
    sha256Compressed: "63080c30f462c40c5b13640ec3218d4283f23916cb00d35dc0e119e3d723cb40",
    description: "Azure Resource Manager (ARM) operation records, VM deallocations, and role assignment audits.",
    sampleContent: [
      '{"caller":"sre-automation@enterprise.onmicrosoft.com","operationName":"Microsoft.Compute/virtualMachines/restart/action","status":"Succeeded"}',
      '{"caller":"devops-deployer","operationName":"Microsoft.Compute/virtualMachines/extensions/write","extension":"AzureMonitorLinuxAgent"}',
      '{"caller":"security-auditor","operationName":"Microsoft.Network/networkSecurityGroups/securityRules/write","status":"Succeeded"}',
    ],
  },
  {
    id: "file-azure-03",
    name: "azure_disk_io_telemetry.log",
    category: "activity",
    type: "json-telemetry",
    environmentId: "azure-vm",
    environmentName: "Azure Virtual Machines",
    originalSizeBytes: 21000000, // 21 MB
    compressedSizeBytes: null, // Ready for compression!
    uploadDate: "2026-09-06 04:50",
    status: "uncompressed",
    linesCount: 135000,
    sha256Original: "e88b8a514d119293818e38d7c2a5",
    description: "Premium SSD disk latency and IOPS throughput telemetry tracking for database clusters.",
    sampleContent: [
      '{"time":"2026-09-06T04:45:00Z","diskId":"datadisk-01","readOps":1240,"writeOps":5920,"readLatencyMs":0.4,"writeLatencyMs":0.7}',
      '{"time":"2026-09-06T04:46:00Z","diskId":"datadisk-01","readOps":1180,"writeOps":6100,"readLatencyMs":0.3,"writeLatencyMs":0.6}',
    ],
  },

  // 5. Google Cloud Compute Engine
  {
    id: "file-gcp-01",
    name: "gcp_vpc_flow_network.log",
    category: "log",
    type: "vpc-flow",
    environmentId: "gcp-compute",
    environmentName: "Google Cloud Compute Engine",
    originalSizeBytes: 76000000, // 76 MB
    compressedSizeBytes: 16800000, // 16.8 MB (Saved 59.2 MB)
    uploadDate: "2026-09-05 13:40",
    status: "compressed",
    linesCount: 560000,
    sha256Original: "f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2",
    sha256Compressed: "3a92b23089d804e41a530fa2d32627ce37374cf2100728a34229ff719d088a58",
    description: "Subnet VPC flow telemetry recording inter-region packets, RTT latencies, and egress volume.",
    sampleContent: [
      '{"connection":{"src_ip":"10.128.0.4","dest_ip":"10.128.1.18","src_port":443,"dest_port":51240,"protocol":6},"bytes_sent":"148200","packets_sent":"98","rtt_msec":"0.84"}',
      '{"connection":{"src_ip":"10.128.0.8","dest_ip":"10.128.0.4","src_port":5432,"dest_port":49120,"protocol":6},"bytes_sent":"284100","packets_sent":"189","rtt_msec":"0.32"}',
      '{"connection":{"src_ip":"34.120.90.12","dest_ip":"10.128.0.4","src_port":443,"dest_port":38190,"protocol":6},"bytes_sent":"4920","packets_sent":"12","rtt_msec":"14.2"}',
    ],
  },
  {
    id: "file-gcp-02",
    name: "gcp_audit_activity_records.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "gcp-compute",
    environmentName: "Google Cloud Compute Engine",
    originalSizeBytes: 44000000, // 44 MB
    compressedSizeBytes: 10100000, // 10.1 MB (Saved 33.9 MB)
    uploadDate: "2026-09-06 00:20",
    status: "compressed",
    linesCount: 270000,
    sha256Original: "00a29f63e0b02f45e82b7cf533b378036735a2283921bfec4df782bf6d21469e",
    sha256Compressed: "c4ca4238a0b923820dcc509a6f75849b3a3ab80005a746a815a7722744ec4aa9",
    description: "Cloud Audit logs detailing Compute Engine instance template creations, autoscaling, and IAM binds.",
    sampleContent: [
      '{"protoPayload":{"@type":"type.googleapis.com/google.cloud.audit.AuditLog","methodName":"v1.compute.instances.insert","serviceName":"compute.googleapis.com","authenticationInfo":{"principalEmail":"terraform@prod-project.iam.gserviceaccount.com"}}}',
      '{"protoPayload":{"methodName":"v1.compute.instanceGroupManagers.resize","serviceName":"compute.googleapis.com","status":{"code":0},"resourceName":"ig-web-frontend"}}',
    ],
  },
  {
    id: "file-gcp-03",
    name: "gcp_kernel_audit.log",
    category: "log",
    type: "kernel-audit",
    environmentId: "gcp-compute",
    environmentName: "Google Cloud Compute Engine",
    originalSizeBytes: 18200000, // 18.2 MB
    compressedSizeBytes: null, // Ready for compression!
    uploadDate: "2026-09-06 05:10",
    status: "uncompressed",
    linesCount: 115000,
    sha256Original: "4a7d1ed414474e4033ac29ccb8653d9b",
    description: "Security-Enhanced Linux (SELinux) syscall audits and container isolation boundary checkpoints.",
    sampleContent: [
      "type=SYSCALL msg=audit(1725599401.412:902): arch=c000003e syscall=257 success=yes exit=3 a0=ffffff9c a1=7ffd3a a2=0 a3=0 items=1 ppid=1 pid=1402 exe=\"/usr/bin/dockerd\"",
      "type=AVC msg=audit(1725599402.012:903): avc:  denied  { read } for  pid=1892 comm=\"redis-server\" name=\"sys\" dev=\"sysfs\" ino=1",
    ],
  },

  // 6. Cloud Application Servers
  {
    id: "file-app-01",
    name: "app_server_transaction_stream.log",
    category: "log",
    type: "syslog",
    environmentId: "cloud-app-servers",
    environmentName: "Cloud Application Servers",
    originalSizeBytes: 88000000, // 88 MB
    compressedSizeBytes: 19800000, // 19.8 MB (Saved 68.2 MB)
    uploadDate: "2026-09-05 17:25",
    status: "compressed",
    linesCount: 620000,
    sha256Original: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    sha256Compressed: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    description: "Microservice application runtime events, gRPC connection lifecycle, and worker job dispatches.",
    sampleContent: [
      "2026-09-05 17:20:01.018 [INFO] [OrderWorker-3] Processing order_id=ord_98124 customer_id=cust_4401 amount=249.50 USD",
      "2026-09-05 17:20:01.042 [DEBUG] [PaymentClient] Received authorization token from gateway in 24ms, status=APPROVED",
      "2026-09-05 17:20:01.089 [INFO] [InventoryService] Stock reserved for sku_4491-XL in warehouse_us_east",
      "2026-09-05 17:20:02.112 [INFO] [AuditLogger] Published order_settled event to Kafka topic 'orders.completed'",
    ],
  },
  {
    id: "file-app-02",
    name: "app_user_sessions_activity.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "cloud-app-servers",
    environmentName: "Cloud Application Servers",
    originalSizeBytes: 51000000, // 51 MB
    compressedSizeBytes: 11400000, // 11.4 MB (Saved 39.6 MB)
    uploadDate: "2026-09-05 20:30",
    status: "compressed",
    linesCount: 310000,
    sha256Original: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    sha256Compressed: "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    description: "Session authorization tokens, JWT invalidations, RBAC role switches, and workspace tenant activities.",
    sampleContent: [
      '{"timestamp":"2026-09-05T20:25:00Z","user":"alex.vance@cloudoptima.io","event":"session_established","ip":"198.51.100.14","mfa":true}',
      '{"timestamp":"2026-09-05T20:26:10Z","user":"marcus.s@finops.cloud","event":"export_cost_report","scope":"aws-ec2","format":"csv"}',
      '{"timestamp":"2026-09-05T20:28:40Z","user":"elena.r@securityops.net","event":"run_verification_checksum","targetFile":"ec2_system_auth.log"}',
    ],
  },
  {
    id: "file-app-03",
    name: "app_gateway_error_dump.log",
    category: "log",
    type: "syslog",
    environmentId: "cloud-app-servers",
    environmentName: "Cloud Application Servers",
    originalSizeBytes: 24500000, // 24.5 MB
    compressedSizeBytes: null, // Ready for compression!
    uploadDate: "2026-09-06 06:45",
    status: "uncompressed",
    linesCount: 160000,
    sha256Original: "5d41402abc4b2a76b9719d911017c592",
    description: "HTTP 5xx server exceptions, timeout traces, and upstream microservice circuit breaker trips.",
    sampleContent: [
      "2026-09-06 06:40:01 [WARN] [RateLimiter] IP 203.0.113.88 exceeded burst threshold (120 req/sec) -> throttling for 30s",
      "2026-09-06 06:41:12 [ERROR] [UpstreamProxy] Connection timeout after 5000ms connecting to cart-service:8080",
    ],
  },

  // =========================================================================
  // ADDITIONAL LOG FILES & ACTIVITY FILES (INCLUDING REPEATED / DUPLICATE FILES)
  // =========================================================================

  // AWS EC2 Repeated & Additional Files
  {
    id: "file-ec2-dup-01",
    name: "ec2_nginx_access_replica_backup.log",
    category: "log",
    type: "apache-access",
    environmentId: "aws-ec2",
    environmentName: "AWS EC2",
    originalSizeBytes: 82000000, // 82 MB - EXACT DUPLICATE
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 07:15",
    status: "uncompressed",
    linesCount: 520000,
    sha256Original: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", // Matches file-ec2-02
    description: "Duplicate zone replica of Nginx web server access logs accidentally retained in secondary EBS mount.",
    isDuplicate: true,
    duplicateOfId: "file-ec2-02",
    duplicateReason: "Identical SHA-256 raw checksum match with ec2_nginx_access.log (100% redundant clone)",
    repetitionScore: 100,
    sampleContent: [
      '172.31.22.45 - - [05/Sep/2026:18:35:01 +0000] "GET /api/v2/telemetry/heartbeat HTTP/1.1" 200 48 "https://app.cloudoptima.io"',
      '172.31.22.46 - - [05/Sep/2026:18:35:02 +0000] "POST /api/v2/compression/jobs HTTP/1.1" 201 512 "https://app.cloudoptima.io"',
    ],
  },
  {
    id: "file-ec2-04",
    name: "ec2_system_auth_worker2.log",
    category: "log",
    type: "syslog",
    environmentId: "aws-ec2",
    environmentName: "AWS EC2",
    originalSizeBytes: 41200000, // 41.2 MB
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 08:10",
    status: "uncompressed",
    linesCount: 295000,
    sha256Original: "c82b01479fa03b129841f391802bcad381920",
    description: "Systemd journal and PAM security authentication events from secondary EC2 worker node.",
    sampleContent: [
      "Sep 06 08:01:10 ec2-worker-02 sshd[9128]: Accepted publickey for ubuntu from 10.0.12.91 port 48210 ssh2",
      "Sep 06 08:02:45 ec2-worker-02 sudo: ubuntu : TTY=pts/1 ; COMMAND=/usr/bin/docker ps",
    ],
  },
  {
    id: "file-ec2-dup-02",
    name: "ec2_security_audit_events_copy.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "aws-ec2",
    environmentName: "AWS EC2",
    originalSizeBytes: 34000000, // 34 MB - EXACT DUPLICATE
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 08:30",
    status: "uncompressed",
    linesCount: 198000,
    sha256Original: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // Matches file-ec2-03
    description: "Duplicate security audit json stream ingested by redundant SIEM forwarder agent.",
    isDuplicate: true,
    duplicateOfId: "file-ec2-03",
    duplicateReason: "Repeated ingestion by secondary forwarder daemon (identical event timestamps and records)",
    repetitionScore: 100,
    sampleContent: [
      '{"timestamp":"2026-09-06T02:10:00Z","actor":"iam:sec-automation","action":"ec2:AuthorizeSecurityGroupIngress"}',
      '{"timestamp":"2026-09-06T02:11:15Z","actor":"iam:ci-deployer","action":"ec2:CreateSnapshot"}',
    ],
  },
  {
    id: "file-ec2-05",
    name: "ec2_auto_scaling_activity.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "aws-ec2",
    environmentName: "AWS EC2",
    originalSizeBytes: 29800000, // 29.8 MB
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 09:05",
    status: "uncompressed",
    linesCount: 182000,
    sha256Original: "fa791823019bc8201948201bc840182b8a0",
    description: "Auto Scaling group launch lifecycle hooks, capacity adjustments, and termination notifications.",
    sampleContent: [
      '{"timestamp":"2026-09-06T09:00:10Z","asg":"asg-prod-workers","event":"EC2_INSTANCE_LAUNCH","instanceId":"i-04f820ac"}',
      '{"timestamp":"2026-09-06T09:02:00Z","asg":"asg-prod-workers","event":"EC2_INSTANCE_TERMINATE_SUCCESSFUL"}',
    ],
  },

  // AWS Lambda Repeated & Additional Files
  {
    id: "file-lambda-dup-01",
    name: "lambda_execution_stream_retry_dup.log",
    category: "log",
    type: "syslog",
    environmentId: "aws-lambda",
    environmentName: "AWS Lambda",
    originalSizeBytes: 56000000, // 56 MB - EXACT DUPLICATE
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 09:20",
    status: "uncompressed",
    linesCount: 410000,
    sha256Original: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d", // Matches file-lambda-01
    description: "Duplicate serverless CloudWatch stream generated by automatic kinesis retry re-dispatch.",
    isDuplicate: true,
    duplicateOfId: "file-lambda-01",
    duplicateReason: "Serverless stream re-delivery replay; bitwise match to lambda_execution_stream.log",
    repetitionScore: 100,
    sampleContent: [
      "2026-09-05T21:05:01.102Z START RequestId: 4f8812a0-9bc2-4f81-9b12-ca908bf12903 Version: $LATEST",
      "2026-09-05T21:05:01.115Z [INFO] Received payload event: { batchId: 'batch_9021', recordsCount: 150 }",
    ],
  },
  {
    id: "file-lambda-04",
    name: "lambda_step_functions_activity.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "aws-lambda",
    environmentName: "AWS Lambda",
    originalSizeBytes: 31500000, // 31.5 MB
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 09:40",
    status: "uncompressed",
    linesCount: 204000,
    sha256Original: "912a0f837b018374b92817203b8417c80281b",
    description: "State machine execution transitions, map state iterations, and parallel branch results.",
    sampleContent: [
      '{"executionArn":"arn:aws:states:us-west-2:pipe-01","stateEntered":"ProcessBatchChunk","inputRecordCount":48}',
      '{"executionArn":"arn:aws:states:us-west-2:pipe-01","stateExited":"ProcessBatchChunk","status":"SUCCEEDED"}',
    ],
  },

  // AWS S3 Repeated & Additional Files
  {
    id: "file-s3-dup-01",
    name: "s3_bucket_access_records_mirror.log",
    category: "log",
    type: "cloudtrail",
    environmentId: "aws-s3",
    environmentName: "AWS S3",
    originalSizeBytes: 95000000, // 95 MB - EXACT DUPLICATE
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 09:55",
    status: "uncompressed",
    linesCount: 680000,
    sha256Original: "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9", // Matches file-s3-01
    description: "Repeated access log archive duplicated during cross-account S3 sync replication.",
    isDuplicate: true,
    duplicateOfId: "file-s3-01",
    duplicateReason: "Object replicated with identical content into secondary bucket without deduplication",
    repetitionScore: 100,
    sampleContent: [
      '795f9392e1329d ec2-prod-worker [05/Sep/2026:09:28:01 +0000] 10.0.1.25 REST.GET.OBJECT logs/archive/2026-09.tar',
    ],
  },
  {
    id: "file-s3-04",
    name: "s3_inventory_manifest_activity.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "aws-s3",
    environmentName: "AWS S3",
    originalSizeBytes: 48000000, // 48 MB
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 10:15",
    status: "uncompressed",
    linesCount: 312000,
    sha256Original: "19840192837bc901829471b0c918237b0192834b",
    description: "Daily object manifest output detailing storage class tiering and encryption metadata.",
    sampleContent: [
      '{"bucket":"optima-enterprise-cold","key":"data/part-001.bin","size":104857600,"storageClass":"STANDARD"}',
      '{"bucket":"optima-enterprise-cold","key":"data/part-002.bin","size":104857600,"storageClass":"INTELLIGENT_TIERING"}',
    ],
  },

  // Azure VM Repeated & Additional Files
  {
    id: "file-azure-dup-01",
    name: "azure_vm_syslog_daemon_standby.log",
    category: "log",
    type: "syslog",
    environmentId: "azure-vm",
    environmentName: "Azure Virtual Machines",
    originalSizeBytes: 64000000, // 64 MB - EXACT DUPLICATE
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 10:30",
    status: "uncompressed",
    linesCount: 440000,
    sha256Original: "11a52708221b6d0c9f1396b281f62137e408d6d63ef2653ea9540b955dcb3947", // Matches file-azure-01
    description: "Standby database VM node mirror logging identical systemd syslog stream.",
    isDuplicate: true,
    duplicateOfId: "file-azure-01",
    duplicateReason: "Active-standby pacemaker clustering sync generated redundant twin syslog file",
    repetitionScore: 100,
    sampleContent: [
      "Sep 05 11:10:01 az-vm-db-cluster-01 python3[892]: 2026/09/05 11:10:01.402 INFO ExtHandler Env ping status: healthy",
    ],
  },
  {
    id: "file-azure-04",
    name: "azure_network_nsg_flow.log",
    category: "log",
    type: "vpc-flow",
    environmentId: "azure-vm",
    environmentName: "Azure Virtual Machines",
    originalSizeBytes: 52000000, // 52 MB
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 10:45",
    status: "uncompressed",
    linesCount: 380000,
    sha256Original: "7102938471b0293847192837410293847102938",
    description: "Network Security Group flow log tracking permitted inbound subnet traffic and TCP handshakes.",
    sampleContent: [
      '{"time":"2026-09-06 10:40:00","rule":"Allow-HTTPS","srcIp":"198.51.100.22","destIp":"10.2.0.4","mac":"00-0D-3A","decision":"A"}',
    ],
  },
  {
    id: "file-azure-dup-02",
    name: "azure_activity_log_audit_backup.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "azure-vm",
    environmentName: "Azure Virtual Machines",
    originalSizeBytes: 38000000, // 38 MB - EXACT DUPLICATE
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 11:00",
    status: "uncompressed",
    linesCount: 210000,
    sha256Original: "2e7d2c03a9507ae265ecf5b5356885a53393a2029d24139499ddf69f0d481ac2", // Matches file-azure-02
    description: "Duplicate export of Azure ARM activity log stored in cold storage blob backup container.",
    isDuplicate: true,
    duplicateOfId: "file-azure-02",
    duplicateReason: "Scheduled Azure storage backup created identical snapshot duplicate",
    repetitionScore: 100,
    sampleContent: [
      '{"caller":"sre-automation@enterprise.onmicrosoft.com","operationName":"Microsoft.Compute/virtualMachines/restart/action"}',
    ],
  },

  // GCP Compute Engine Repeated & Additional Files
  {
    id: "file-gcp-dup-01",
    name: "gcp_vpc_flow_network_replica.log",
    category: "log",
    type: "vpc-flow",
    environmentId: "gcp-compute",
    environmentName: "Google Cloud Compute Engine",
    originalSizeBytes: 76000000, // 76 MB - EXACT DUPLICATE
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 11:15",
    status: "uncompressed",
    linesCount: 560000,
    sha256Original: "f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2", // Matches file-gcp-01
    description: "Duplicate VPC flow log stream resulting from dual-destination Cloud Logging sink configuration.",
    isDuplicate: true,
    duplicateOfId: "file-gcp-01",
    duplicateReason: "Dual-sink log router routing to both BigQuery and GCS created 100% duplicate file",
    repetitionScore: 100,
    sampleContent: [
      '{"connection":{"src_ip":"10.128.0.4","dest_ip":"10.128.1.18","src_port":443,"dest_port":51240,"protocol":6},"bytes_sent":"148200"}',
    ],
  },
  {
    id: "file-gcp-04",
    name: "gcp_kubernetes_engine_workload.log",
    category: "log",
    type: "syslog",
    environmentId: "gcp-compute",
    environmentName: "Google Cloud Compute Engine",
    originalSizeBytes: 62000000, // 62 MB
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 11:30",
    status: "uncompressed",
    linesCount: 420000,
    sha256Original: "0192837461928374610293847561029384756102",
    description: "GKE node daemonset logs, containerd sandbox events, and cluster autoscaling metrics.",
    sampleContent: [
      "I0906 11:28:10.1920 1 leaderelection.go:248] successfully acquired lease kube-system/gke-autoscaler",
      "I0906 11:28:15.8912 1 static_autoscaler.go:210] Scaled node pool 'highmem-pool' from 6 to 8 nodes",
    ],
  },
  {
    id: "file-gcp-05",
    name: "gcp_cloud_build_ci_activity.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "gcp-compute",
    environmentName: "Google Cloud Compute Engine",
    originalSizeBytes: 36000000, // 36 MB
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 11:45",
    status: "uncompressed",
    linesCount: 228000,
    sha256Original: "8201948201938471029384719283740192837410",
    description: "Cloud Build container compilation pipelines, artifact registry pushes, and vulnerability scans.",
    sampleContent: [
      '{"buildId":"bld-49120","step":"docker-build","image":"gcr.io/optima/service:v2.4","status":"SUCCESS","durationSec":42}',
    ],
  },

  // Cloud Application Servers Repeated & Additional Files
  {
    id: "file-app-dup-01",
    name: "app_server_transaction_replica_node2.log",
    category: "log",
    type: "syslog",
    environmentId: "cloud-app-servers",
    environmentName: "Cloud Application Servers",
    originalSizeBytes: 88000000, // 88 MB - EXACT DUPLICATE
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 12:00",
    status: "uncompressed",
    linesCount: 620000,
    sha256Original: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a", // Matches file-app-01
    description: "Duplicate transaction stream mirrored by secondary ingress gateway before load balancing split.",
    isDuplicate: true,
    duplicateOfId: "file-app-01",
    duplicateReason: "Traffic mirroring packet capture created 100% duplicate transaction log archive",
    repetitionScore: 100,
    sampleContent: [
      "2026-09-05 17:20:01.018 [INFO] [OrderWorker-3] Processing order_id=ord_98124 customer_id=cust_4401 amount=249.50 USD",
      "2026-09-05 17:20:01.042 [DEBUG] [PaymentClient] Received authorization token from gateway in 24ms, status=APPROVED",
    ],
  },
  {
    id: "file-app-04",
    name: "app_database_query_performance.log",
    category: "log",
    type: "syslog",
    environmentId: "cloud-app-servers",
    environmentName: "Cloud Application Servers",
    originalSizeBytes: 67000000, // 67 MB
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 12:15",
    status: "uncompressed",
    linesCount: 450000,
    sha256Original: "9102938471928374619283746192837461928374",
    description: "Slow query execution statistics, database connection pool exhaustion traces, and locks.",
    sampleContent: [
      "2026-09-06 12:10:01.402 [WARN] [DBPool] Slow query (842ms): SELECT * FROM customer_transactions WHERE tenant_id = 't_441'",
      "2026-09-06 12:10:15.119 [INFO] [DBPool] Active connections: 42/100, idle: 58, peak latency: 12ms",
    ],
  },
  {
    id: "file-app-dup-02",
    name: "app_user_sessions_activity_mirror.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "cloud-app-servers",
    environmentName: "Cloud Application Servers",
    originalSizeBytes: 51000000, // 51 MB - EXACT DUPLICATE
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 12:30",
    status: "uncompressed",
    linesCount: 310000,
    sha256Original: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b", // Matches file-app-02
    description: "Duplicate session telemetry stored by compliance mirror in secondary jurisdiction.",
    isDuplicate: true,
    duplicateOfId: "file-app-02",
    duplicateReason: "Cross-region telemetry mirror holding identical JWT session authentication logs",
    repetitionScore: 100,
    sampleContent: [
      '{"timestamp":"2026-09-05T20:25:00Z","user":"alex.vance@cloudoptima.io","event":"session_established"}',
    ],
  },
  {
    id: "file-app-05",
    name: "app_api_rate_limit_violations.json",
    category: "activity",
    type: "json-telemetry",
    environmentId: "cloud-app-servers",
    environmentName: "Cloud Application Servers",
    originalSizeBytes: 27500000, // 27.5 MB
    compressedSizeBytes: null,
    uploadDate: "2026-09-06 12:45",
    status: "uncompressed",
    linesCount: 175000,
    sha256Original: "1029384756102938475610293847561029384756",
    description: "API throttling events, DDoS mitigation challenges, and client API token quotas.",
    sampleContent: [
      '{"timestamp":"2026-09-06T12:40:00Z","clientKey":"key_live_9481","limit":1000,"consumed":1042,"action":"THROTTLED"}',
    ],
  },
];

export const INITIAL_ACTIVITIES: RecentActivityItem[] = [
  {
    id: "act-01",
    action: "Verification",
    fileName: "ec2_system_auth.log",
    fileId: "file-ec2-01",
    environmentName: "AWS EC2",
    timestamp: "10 mins ago",
    details: "Lossless bitwise SHA-256 verification passed (100% matched: e3b0c442... == e3b0c442...).",
    status: "success",
    metric: "100% Bitwise Match",
  },
  {
    id: "act-02",
    action: "Compression",
    fileName: "s3_bucket_access_records.log",
    fileId: "file-s3-01",
    environmentName: "AWS S3",
    timestamp: "24 mins ago",
    details: "Reduced original 95.0 MB down to 19.0 MB using semantic deduplication and entropy coding.",
    status: "success",
    metric: "Saved 76.0 MB (80.0%)",
  },
  {
    id: "act-03",
    action: "Reports",
    fileName: "app_user_sessions_activity.json",
    fileId: "file-app-02",
    environmentName: "Cloud Application Servers",
    timestamp: "45 mins ago",
    details: "Generated FinOps storage cost savings report and environmental quota audit for billing.",
    status: "info",
    metric: "$284/mo Projected ROI",
  },
  {
    id: "act-04",
    action: "Decompression",
    fileName: "azure_vm_syslog_daemon.log",
    fileId: "file-azure-01",
    environmentName: "Azure Virtual Machines",
    timestamp: "1 hour ago",
    details: "Restored full 440,000 lines from 14.7 MB archive in 184ms with zero data truncation.",
    status: "success",
    metric: "184ms Speed",
  },
  {
    id: "act-05",
    action: "AI analysis",
    fileName: "gcp_vpc_flow_network.log",
    fileId: "file-gcp-01",
    environmentName: "Google Cloud Compute Engine",
    timestamp: "2 hours ago",
    details: "AI pattern extraction identified 14 recurring IP connection templates covering 96.4% of lines.",
    status: "success",
    metric: "14 Patterns Discovered",
  },
  {
    id: "act-06",
    action: "Preprocessing",
    fileName: "app_server_transaction_stream.log",
    fileId: "file-app-01",
    environmentName: "Cloud Application Servers",
    timestamp: "3 hours ago",
    details: "Extracted timestamp indexes, isolated variable numeric tokens, and normalized log headers.",
    status: "success",
    metric: "620,000 Lines Normalized",
  },
  {
    id: "act-07",
    action: "File type detection",
    fileName: "lambda_edge_router.log",
    fileId: "file-lambda-03",
    environmentName: "AWS Lambda",
    timestamp: "4 hours ago",
    details: "Detected format: RFC-5424 Syslog stream with UTF-8 character encoding and JSON payloads.",
    status: "info",
    metric: "Format: Syslog RFC-5424",
  },
  {
    id: "act-08",
    action: "Upload",
    fileName: "app_gateway_error_dump.log",
    fileId: "file-app-03",
    environmentName: "Cloud Application Servers",
    timestamp: "5 hours ago",
    details: "Ingested 24.5 MB log package from edge cluster via HTTPS direct streaming API.",
    status: "info",
    metric: "24.5 MB Ingested",
  },
];
