import 'package:flutter/material.dart';

class CommissionDisplay extends StatelessWidget {
  final double commissionAmount;
  final double centerEarnings;
  final double totalPrice;

  const CommissionDisplay({
    super.key,
    required this.commissionAmount,
    required this.centerEarnings,
    required this.totalPrice,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.blue[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.account_balance_wallet, color: Colors.blue[700]),
                const SizedBox(width: 12),
                Text(
                  'Commission Breakdown',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.blue[900],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Total amount
            _CommissionRow(
              label: 'Total Amount',
              amount: totalPrice,
              isBold: true,
            ),
            const SizedBox(height: 8),
            const Divider(),
            const SizedBox(height: 8),

            // Doctor commission
            _CommissionRow(
              label: 'Your Commission',
              amount: commissionAmount,
              color: Colors.green[700],
              icon: Icons.arrow_upward,
            ),
            const SizedBox(height: 8),

            // Center earnings
            _CommissionRow(
              label: 'Center Earnings',
              amount: centerEarnings,
              color: Colors.blue[700],
              icon: Icons.business,
            ),
            const SizedBox(height: 12),

            // Info message
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue[200]!),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, size: 16, color: Colors.blue[700]),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Commission calculated automatically upon checkout',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.blue[700],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CommissionRow extends StatelessWidget {
  final String label;
  final double amount;
  final Color? color;
  final IconData? icon;
  final bool isBold;

  const _CommissionRow({
    required this.label,
    required this.amount,
    this.color,
    this.icon,
    this.isBold = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            if (icon != null) ...[
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 8),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: isBold ? 16 : 14,
                fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
                color: color ?? Colors.grey[800],
              ),
            ),
          ],
        ),
        Text(
          '\$${amount.toStringAsFixed(2)}',
          style: TextStyle(
            fontSize: isBold ? 18 : 16,
            fontWeight: FontWeight.bold,
            color: color ?? Colors.grey[900],
          ),
        ),
      ],
    );
  }
}
