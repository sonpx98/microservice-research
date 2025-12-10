import { Shield, Mail, Lock, Activity, AlertTriangle } from 'lucide-react';
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
      <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              🏦 Trusted Banking Site (bank.com)
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This is the legitimate banking website. The victim is logged in. Watch what happens when the CSRF attack is launched.
            </p>
          </div>
        </div>
      </div>

      {/* Victim Profile */}
      <div className="mb-6 p-5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
            V
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Victim User</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {victimEmail}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
            <Lock className="w-3 h-3" />
            Logged In
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Balance</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${victimBalance.toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Security Status</div>
            <div className={`text-sm font-semibold ${
              networkRequests.length > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-green-600 dark:text-green-400'
            }`}>
              {networkRequests.length > 0 ? '⚠️ Under Attack' : '✓ Protected'}
            </div>
          </div>
        </div>
      </div>

      {/* Network Request Inspector */}
      <NetworkRequestInspector requests={networkRequests} />

      {isAttacking && (
        <div className="mt-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 animate-pulse">
          <p className="text-sm text-orange-800 dark:text-orange-200 flex items-center gap-2">
            <Activity className="w-4 h-4 animate-spin" />
            Processing malicious request from evil.com...
          </p>
        </div>
      )}

      {/* Attacker Gains (visible in victim tab) */}
      {attackerBalance > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Money Stolen
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                Attacker has stolen money from this account
              </p>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${attackerBalance.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
