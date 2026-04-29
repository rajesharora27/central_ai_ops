import { gql, useQuery } from '@apollo/client';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, CircularProgress,
} from '@mui/material';

const AUDIT_QUERY = gql`
  query AuditLogs {
    auditLogs(first: 100) {
      id action userId artifactId projectId details createdAt
      artifact { name displayName }
      project { name slug }
    }
  }
`;

const ACTION_COLORS: Record<string, 'primary' | 'success' | 'error' | 'warning' | 'info' | 'secondary'> = {
  CREATE: 'success',
  UPDATE: 'primary',
  DELETE: 'error',
  VERIFY: 'info',
  SYNC: 'warning',
  APPLY: 'secondary',
};

type AuditLog = {
  id: string; action: string; userId: string | null;
  artifactId: string | null; projectId: string | null;
  details: unknown; createdAt: string;
  artifact: { name: string; displayName: string } | null;
  project: { name: string; slug: string } | null;
};

export default function AuditPage() {
  const { data, loading } = useQuery(AUDIT_QUERY, { pollInterval: 15000 });
  const logs: AuditLog[] = data?.auditLogs ?? [];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Audit Log</Typography>
      {loading && !data ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Artifact</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>User</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={log.action} color={ACTION_COLORS[log.action] ?? 'default'} size="small" />
                  </TableCell>
                  <TableCell>{log.artifact?.displayName ?? '—'}</TableCell>
                  <TableCell>{log.project?.name ?? '—'}</TableCell>
                  <TableCell>{log.userId ?? '—'}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">No audit entries yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
