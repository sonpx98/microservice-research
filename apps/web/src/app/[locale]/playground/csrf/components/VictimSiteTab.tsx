import { Shield, Mail, Lock, Activity, AlertTriangle, Building2 } from 'lucide-react';
import { NetworkRequestInspector, NetworkRequest } from './NetworkRequestInspector';

interface VictimSiteTabProps {
  victimEmail: string;
  victimBalance: number;
  networkRequests: NetworkRequest[];
  isAttacking: boolean;
  attackerBalance: number;
}

export function VictimSiteTab({
  victimEmail,
  victimBalance,
  networkRequests,
  isAttacking,
  attackerBalance,
}: VictimSiteTabProps) {
  return (
    <div className="p-6">
      <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold text-primary mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Trusted Banking Site (bank.com)
            </h3>
            <p className="text-sm text-primary">
              This is the legitimate banking website. The victim is logged in. Watch what happens when the CSRF attack is launched.
            </p>
          </div>
        </div>
      </div>

      {/* Victim Profile */}
      <div className="mb-6 p-5 rounded-lg bg-primary/10 border border-primary/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            V
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Victim User</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {victimEmail}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
            <Lock className="w-3 h-3" />
            Logged In
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="text-xs text-muted-foreground mb-1">Account Balance</div>
            <div className="text-2xl font-bold text-foreground">
              ${victimBalance.toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="text-xs text-muted-foreground mb-1">Security Status</div>
            <div className={`text-sm font-semibold ${
              networkRequests.length > 0
                ? 'text-danger'
                : 'text-success'
            }`}>
              {networkRequests.length > 0 ? <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Under Attack</span> : '✓ Protected'}
            </div>
          </div>
        </div>
      </div>

      {/* Network Request Inspector */}
      <NetworkRequestInspector requests={networkRequests} />

      {isAttacking && (
        <div className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/30 animate-pulse">
          <p className="text-sm text-warning flex items-center gap-2">
            <Activity className="w-4 h-4 animate-spin" />
            Processing malicious request from evil.com...
          </p>
        </div>
      )}

      {/* Attacker Gains (visible in victim tab) */}
      {attackerBalance > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-danger/10 border border-danger/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-danger mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Money Stolen
              </h4>
              <p className="text-sm text-danger">
                Attacker has stolen money from this account
              </p>
            </div>
            <div className="text-2xl font-bold text-danger">
              ${attackerBalance.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
