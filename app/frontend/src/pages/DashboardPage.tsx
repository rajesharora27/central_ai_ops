import { gql, useQuery } from '@apollo/client';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';

const DASHBOARD_QUERY = gql`
  query ComplianceDashboard {
    complianceDashboard {
      totalProjects
      compliantCount
      driftedCount
      nonCompliantCount
      unknownCount
      totalArtifacts
      activeArtifacts
      projects {
        id name slug complianceStatus complianceScore lastVerifiedAt
      }
      recentChecks {
        id status score summary triggeredBy createdAt
        project { name slug }
      }
    }
  }
`;

const STATUS_CONFIG: Record<string, { color: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactNode; label: string }> = {
  COMPLIANT: { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Compliant' },
  DRIFTED: { color: 'warning', icon: <WarningIcon fontSize="small" />, label: 'Drifted' },
  NON_COMPLIANT: { color: 'error', icon: <ErrorIcon fontSize="small" />, label: 'Non-Compliant' },
  UNKNOWN: { color: 'default', icon: <HelpIcon fontSize="small" />, label: 'Unknown' },
  PENDING: { color: 'default', icon: <HelpIcon fontSize="small" />, label: 'Pending' },
};

function StatusChip({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.UNKNOWN;
  return <Chip icon={config.icon as React.ReactElement} label={config.label} color={config.color} size="small" variant="outlined" />;
}

type SummaryCardProps = { title: string; value: number; color: string };
function SummaryCard({ title, value, color }: SummaryCardProps) {
  return (
    <Card>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ color, fontWeight: 700 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, loading, refetch } = useQuery(DASHBOARD_QUERY, { pollInterval: 30000 });

  if (loading && !data) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  const d = data?.complianceDashboard;
  if (!d) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Compliance Dashboard</Typography>
        <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}><SummaryCard title="Total Projects" value={d.totalProjects} color="#1565C0" /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><SummaryCard title="Compliant" value={d.compliantCount} color="#15803D" /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><SummaryCard title="Drifted" value={d.driftedCount} color="#C2410C" /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><SummaryCard title="Non-Compliant" value={d.nonCompliantCount} color="#BE123C" /></Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Projects</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Score</TableCell>
                  <TableCell>Last Verified</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {d.projects.map((p: { id: string; name: string; complianceStatus: string; complianceScore: number | null; lastVerifiedAt: string | null }) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell><StatusChip status={p.complianceStatus} /></TableCell>
                    <TableCell align="right">{p.complianceScore !== null ? `${p.complianceScore}%` : '—'}</TableCell>
                    <TableCell>{p.lastVerifiedAt ? new Date(p.lastVerifiedAt).toLocaleDateString() : 'Never'}</TableCell>
                  </TableRow>
                ))}
                {d.projects.length === 0 && (
                  <TableRow><TableCell colSpan={4} align="center">No projects registered</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Recent Checks</Typography>
          <Card>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              {d.recentChecks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No compliance checks yet</Typography>
              ) : (
                d.recentChecks.slice(0, 10).map((c: { id: string; status: string; summary: string; triggeredBy: string; createdAt: string; project: { name: string } }) => (
                  <Box key={c.id} sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={500}>{c.project.name}</Typography>
                      <StatusChip status={c.status} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {c.summary} — {c.triggeredBy} — {new Date(c.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Artifacts</Typography>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary" fontWeight={700}>{d.activeArtifacts}</Typography>
                <Typography variant="body2" color="text.secondary">Active artifacts ({d.totalArtifacts} total)</Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
