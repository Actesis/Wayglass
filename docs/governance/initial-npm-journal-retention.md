# Create-only staging journal checkpoints

This unwired checkpoint port takes a validated approval and a storage provider. It checks the local
journal digest, approval/run binding, contiguous row sequence and exact extension of the previous
snapshot. It stores the first snapshot under a create-only approval-ID claim, then stores each
successor separately. It independently reads back and compares exact bytes before allowing the
adapter to proceed. Conflicts, ambiguous writes, truncation, readback failures and local mutation
stop the port; neither remote evidence nor the local journal is removed.

The caller must supply only the guarded adapter's sanitized journal. This port does not authenticate
approval or accept arbitrary journal uploads. The provider must offer atomic create-if-absent,
independent bounded readback, and retention outside the runner. It must prevent overwrites and
deletion of claims for the entire replay-protection period. For example,
[S3 conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html)
offer an atomic create condition, but bucket policy and retention would need separate review. No
cloud provider is selected or provisioned by this change.

Tests simulate the provider, including reuse across attempts and response loss after a successful
create. A simulated checkpoint is not evidence of real remote durability. The production provider,
credentials, policy, and workflow wiring remain separate.
