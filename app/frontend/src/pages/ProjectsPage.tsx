import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  Box, Typography, Button, Card, CardContent, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Grid, LinearProgress, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

const PROJECTS_QUERY = gql`
  query Projects {
    projects(first: 100) {
      edges {
        node {
          id name slug repoPath repoUrl description isActive
          complianceStatus complianceScore lastVerifiedAt apiKey
          assignments { id artifact { id name displayName type } environments isRequired }
        }
      }
      totalCount
    }
  }
`;

const ALL_ARTIFACTS_QUERY = gql`
  query AllArtifacts {
    artifacts(first: 500, filter: { isActive: true }) {
      edges { node { id name displayName type } }
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) { id name slug }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) { deleteProject(id: $id) }
`;

const VERIFY_COMPLIANCE = gql`
  mutation VerifyCompliance($projectId: ID!) {
    verifyProjectCompliance(projectId: $projectId) {
      status score summary artifacts { artifactId artifactName artifactType status reason }
    }
  }
`;

const APPLY_GOVERNANCE = gql`
  mutation ApplyGovernance($projectId: ID!) {
    applyGovernanceToProject(projectId: $projectId) { success message artifactsApplied }
  }
`;

const BULK_ASSIGN = gql`
  mutation BulkAssign($projectId: ID!, $artifactIds: [ID!]!, $environments: [AIEnvironment!]!) {
    bulkAssignArtifacts(projectId: $projectId, artifactIds: $artifactIds, environments: $environments) { id }
  }
`;

const STATUS_ICON: Record<string, React.ReactNode> = {
  COMPLIANT: <CheckCircleIcon color="success" />,
  DRIFTED: <WarningIcon color="warning" />,
  NON_COMPLIANT: <ErrorIcon color="error" />,
};

type Project = {
  id: string; name: string; slug: string; repoPath: string | null;
  repoUrl: string | null; description: string | null;
  complianceStatus: string; complianceScore: number | null;
  lastVerifiedAt: string | null; apiKey: string | null;
  assignments: { id: string; artifact: { id: string; name: string; displayName: string; type: string }; environments: string[]; isRequired: boolean }[];
};

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [verifyResult, setVerifyResult] = useState<string>('');

  const { data, loading, refetch } = useQuery(PROJECTS_QUERY);
  const { data: artifactsData } = useQuery(ALL_ARTIFACTS_QUERY);
  const [createProject] = useMutation(CREATE_PROJECT, { onCompleted: () => { refetch(); setDialogOpen(false); } });
  const [deleteProject] = useMutation(DELETE_PROJECT, { onCompleted: () => refetch() });
  const [verifyCompliance] = useMutation(VERIFY_COMPLIANCE);
  const [applyGovernance] = useMutation(APPLY_GOVERNANCE);
  const [bulkAssign] = useMutation(BULK_ASSIGN);

  const projects: Project[] = data?.projects?.edges?.map((e: { node: Project }) => e.node) ?? [];
  const allArtifacts = artifactsData?.artifacts?.edges?.map((e: { node: { id: string; name: string; displayName: string; type: string } }) => e.node) ?? [];

  const handleVerify = async (projectId: string) => {
    const { data: d } = await verifyCompliance({ variables: { projectId } });
    const r = d?.verifyProjectCompliance;
    setVerifyResult(`${r.summary} (Score: ${r.score}%)`);
    refetch();
    setTimeout(() => setVerifyResult(''), 5000);
  };

  const handleApply = async (projectId: string) => {
    if (!confirm('Apply all governance artifacts to this project? This will run bootstrap_link.sh.')) return;
    const { data: d } = await applyGovernance({ variables: { projectId } });
    const r = d?.applyGovernanceToProject;
    setVerifyResult(r.message + ` (${r.artifactsApplied} artifacts)`);
    refetch();
    setTimeout(() => setVerifyResult(''), 5000);
  };

  const handleAssignAll = async (projectId: string) => {
    const ids = allArtifacts.map((a: { id: string }) => a.id);
    if (ids.length === 0) return;
    await bulkAssign({ variables: { projectId, artifactIds: ids, environments: ['ALL'] } });
    refetch();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete project "${name}"?`)) {
      deleteProject({ variables: { id } });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Register Project
        </Button>
      </Box>

      {verifyResult && <Alert severity="info" sx={{ mb: 2 }}>{verifyResult}</Alert>}

      {loading && !data ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {projects.map((p) => (
            <Grid size={{ xs: 12, md: 6 }} key={p.id}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => setDetailProject(p)}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">{p.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {STATUS_ICON[p.complianceStatus] ?? <Chip label={p.complianceStatus} size="small" />}
                      {p.complianceScore !== null && (
                        <Typography variant="body2" fontWeight={600}>{p.complianceScore}%</Typography>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{p.slug}</Typography>
                  {p.repoPath && <Typography variant="caption" color="text.secondary" display="block">{p.repoPath}</Typography>}
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate" value={p.complianceScore ?? 0}
                      color={p.complianceStatus === 'COMPLIANT' ? 'success' : p.complianceStatus === 'DRIFTED' ? 'warning' : 'error'}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {p.assignments.length} artifacts assigned — Last verified: {p.lastVerifiedAt ? new Date(p.lastVerifiedAt).toLocaleDateString() : 'Never'}
                  </Typography>
                  <Box sx={{ mt: 1.5, display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Verify Compliance">
                      <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleVerify(p.id); }}>
                        <VerifiedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Apply Governance">
                      <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleApply(p.id); }}>
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Assign All Artifacts">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleAssignAll(p.id); }}>
                        <AssignmentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDetailProject(p); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.name); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {projects.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Card><CardContent><Typography color="text.secondary" textAlign="center">No projects registered yet. Click "Register Project" to add one.</Typography></CardContent></Card>
            </Grid>
          )}
        </Grid>
      )}

      <ProjectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={(input) => createProject({ variables: { input } })} />

      {detailProject && (
        <ProjectDetailDialog project={detailProject} onClose={() => setDetailProject(null)} />
      )}
    </Box>
  );
}

function ProjectDialog({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void;
  onCreate: (input: Record<string, unknown>) => Promise<unknown>;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [repoPath, setRepoPath] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    try {
      await onCreate({ name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), repoPath: repoPath || null, description: description || null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Register Project</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField fullWidth label="Project Name" value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} sx={{ mt: 1, mb: 2 }} />
        <TextField fullWidth label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} sx={{ mb: 2 }} helperText="URL-safe identifier" />
        <TextField fullWidth label="Repository Path" value={repoPath} onChange={(e) => setRepoPath(e.target.value)} sx={{ mb: 2 }} helperText="Absolute path on disk (e.g., /Users/you/dev/my-project)" />
        <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={2} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!name.trim()}>Register</Button>
      </DialogActions>
    </Dialog>
  );
}

function ProjectDetailDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{project.name} — Assigned Artifacts</DialogTitle>
      <DialogContent>
        {project.apiKey && (
          <Alert severity="info" sx={{ mb: 2 }}>
            API Key: <code>{project.apiKey}</code> — Use this in CI/CD for automated verification
          </Alert>
        )}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Artifact</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Environments</TableCell>
                <TableCell>Required</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {project.assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.artifact.displayName}</TableCell>
                  <TableCell><Chip label={a.artifact.type} size="small" /></TableCell>
                  <TableCell>{a.environments.map((e) => <Chip key={e} label={e} size="small" variant="outlined" sx={{ mr: 0.5 }} />)}</TableCell>
                  <TableCell>{a.isRequired ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
              {project.assignments.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center">No artifacts assigned</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
