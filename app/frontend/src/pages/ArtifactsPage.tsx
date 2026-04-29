import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  Box, Typography, Button, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, CircularProgress, Alert,
  ToggleButtonGroup, ToggleButton, TextareaAutosize, Tabs, Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SyncIcon from '@mui/icons-material/Sync';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ReactMarkdown from 'react-markdown';

const ARTIFACTS_QUERY = gql`
  query Artifacts($filter: ArtifactFilterInput) {
    artifacts(first: 200, filter: $filter) {
      edges {
        node {
          id name displayName type description filePath
          environments isActive version contentHash
          content createdAt updatedAt
        }
      }
      totalCount
    }
  }
`;

const CREATE_ARTIFACT = gql`
  mutation CreateArtifact($input: ArtifactInput!) {
    createArtifact(input: $input) { id name }
  }
`;

const UPDATE_ARTIFACT = gql`
  mutation UpdateArtifact($id: ID!, $input: ArtifactUpdateInput!) {
    updateArtifact(id: $id, input: $input) { id name }
  }
`;

const DELETE_ARTIFACT = gql`
  mutation DeleteArtifact($id: ID!) { deleteArtifact(id: $id) }
`;

const SYNC_ARTIFACTS = gql`
  mutation SyncArtifacts { syncArtifactsFromDisk { added updated removed errors } }
`;

const GENERATE_CONTENT = gql`
  mutation GenerateContent($input: AIAuthoringInput!) {
    generateArtifactContent(input: $input) {
      content name displayName type confidence
    }
  }
`;

const ARTIFACT_TYPES = ['RULE', 'SKILL', 'WORKFLOW', 'COMMAND', 'ENVIRONMENT_WRAPPER'] as const;
const AI_ENVIRONMENTS = ['ALL', 'CLAUDE', 'CODEX', 'CURSOR', 'OPENCODE', 'AGENTS'] as const;

const TYPE_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  RULE: 'primary',
  SKILL: 'secondary',
  WORKFLOW: 'success',
  COMMAND: 'warning',
  ENVIRONMENT_WRAPPER: 'info',
};

type Artifact = {
  id: string; name: string; displayName: string; type: string;
  description: string | null; filePath: string; environments: string[];
  isActive: boolean; version: number; content: string;
  createdAt: string; updatedAt: string;
};

export default function ArtifactsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editArtifact, setEditArtifact] = useState<Artifact | null>(null);
  const [syncResult, setSyncResult] = useState<string>('');

  const filter = typeFilter ? { type: typeFilter } : undefined;
  const { data, loading, refetch } = useQuery(ARTIFACTS_QUERY, { variables: { filter } });
  const [createArtifact] = useMutation(CREATE_ARTIFACT, { onCompleted: () => { refetch(); setDialogOpen(false); } });
  const [updateArtifact] = useMutation(UPDATE_ARTIFACT, { onCompleted: () => { refetch(); setDialogOpen(false); } });
  const [deleteArtifact] = useMutation(DELETE_ARTIFACT, { onCompleted: () => refetch() });
  const [syncArtifacts, { loading: syncing }] = useMutation(SYNC_ARTIFACTS);

  const artifacts: Artifact[] = data?.artifacts?.edges?.map((e: { node: Artifact }) => e.node) ?? [];

  const handleSync = async () => {
    const { data: d } = await syncArtifacts();
    const r = d?.syncArtifactsFromDisk;
    setSyncResult(`Sync complete: ${r.added} added, ${r.updated} updated, ${r.removed} removed`);
    refetch();
    setTimeout(() => setSyncResult(''), 5000);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete artifact "${name}"?`)) {
      deleteArtifact({ variables: { id } });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Governance Artifacts</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<SyncIcon />} onClick={handleSync} disabled={syncing}>
            {syncing ? 'Syncing...' : 'Sync from Disk'}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditArtifact(null); setDialogOpen(true); }}>
            Create Artifact
          </Button>
        </Box>
      </Box>

      {syncResult && <Alert severity="success" sx={{ mb: 2 }}>{syncResult}</Alert>}

      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={typeFilter} exclusive
          onChange={(_, v) => setTypeFilter(v ?? '')}
          size="small"
        >
          <ToggleButton value="">All</ToggleButton>
          {ARTIFACT_TYPES.map((t) => (
            <ToggleButton key={t} value={t}>{t.replace('_', ' ')}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Environments</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {artifacts.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{a.displayName}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.filePath}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={a.type} color={TYPE_COLORS[a.type] ?? 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    {a.environments.map((env) => (
                      <Chip key={env} label={env} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>v{a.version}</TableCell>
                  <TableCell>{a.isActive ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => { setEditArtifact(a); setDialogOpen(true); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(a.id, a.displayName)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ArtifactDialog
        open={dialogOpen}
        artifact={editArtifact}
        onClose={() => setDialogOpen(false)}
        onCreate={(input) => createArtifact({ variables: { input } })}
        onUpdate={(id, input) => updateArtifact({ variables: { id, input } })}
      />
    </Box>
  );
}

type DialogProps = {
  open: boolean;
  artifact: Artifact | null;
  onClose: () => void;
  onCreate: (input: Record<string, unknown>) => Promise<unknown>;
  onUpdate: (id: string, input: Record<string, unknown>) => Promise<unknown>;
};

function ArtifactDialog({ open, artifact, onClose, onCreate, onUpdate }: DialogProps) {
  const isEdit = !!artifact;
  const [tab, setTab] = useState(0);
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [type, setType] = useState<string>('RULE');
  const [description, setDescription] = useState('');
  const [environments, setEnvironments] = useState<string[]>(['ALL']);
  const [content, setContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const [generateContent] = useMutation(GENERATE_CONTENT);

  const resetForm = () => {
    if (artifact) {
      setName(artifact.name);
      setDisplayName(artifact.displayName);
      setType(artifact.type);
      setDescription(artifact.description ?? '');
      setEnvironments(artifact.environments);
      setContent(artifact.content);
    } else {
      setName('');
      setDisplayName('');
      setType('RULE');
      setDescription('');
      setEnvironments(['ALL']);
      setContent('');
    }
    setAiPrompt('');
    setError('');
    setTab(0);
  };

  const handleEnter = () => resetForm();

  const handleSave = async () => {
    setError('');
    try {
      if (isEdit) {
        await onUpdate(artifact.id, { displayName, description, environments, content });
      } else {
        await onCreate({ name, displayName, type, description, environments, content });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const { data } = await generateContent({
        variables: { input: { prompt: aiPrompt, type, environments } },
      });
      const result = data?.generateArtifactContent;
      if (result) {
        setContent(result.content);
        if (!isEdit) {
          setName(result.name);
          setDisplayName(result.displayName);
        }
        setTab(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth TransitionProps={{ onEnter: handleEnter }}>
      <DialogTitle>{isEdit ? `Edit: ${artifact.displayName}` : 'Create Artifact'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Editor" />
          <Tab label="AI Assisted" icon={<AutoFixHighIcon />} iconPosition="start" />
          <Tab label="Preview" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!isEdit && (
                <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} size="small" sx={{ flex: 1 }} />
              )}
              <TextField label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} size="small" sx={{ flex: 1 }} />
              {!isEdit && (
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Type</InputLabel>
                  <Select value={type} label="Type" onChange={(e) => setType(e.target.value)}>
                    {ARTIFACT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            </Box>
            <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} size="small" multiline rows={2} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Environments</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {AI_ENVIRONMENTS.map((env) => (
                  <Chip
                    key={env} label={env} size="small"
                    color={environments.includes(env) ? 'primary' : 'default'}
                    variant={environments.includes(env) ? 'filled' : 'outlined'}
                    onClick={() => {
                      if (env === 'ALL') {
                        setEnvironments(['ALL']);
                      } else {
                        const without = environments.filter((e) => e !== 'ALL' && e !== env);
                        setEnvironments(environments.includes(env) ? (without.length ? without : ['ALL']) : [...without, env]);
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Content (Markdown)</Typography>
              <TextareaAutosize
                value={content} onChange={(e) => setContent(e.target.value)}
                minRows={15} maxRows={30}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, padding: 12, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </Box>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Describe what you want the governance artifact to do. The AI will generate the markdown content for you.
            </Typography>
            <TextField
              label="Describe the artifact" value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              multiline rows={4} placeholder="e.g., Create a rule that requires all database migrations to be reversible and tested in staging before production..."
            />
            <Button variant="contained" startIcon={<AutoFixHighIcon />} onClick={handleGenerate} disabled={generating || !aiPrompt.trim()}>
              {generating ? 'Generating...' : 'Generate with AI'}
            </Button>
            {content && (
              <Alert severity="info">Content generated. Switch to the Editor tab to review and edit, or to Preview to see the rendered output.</Alert>
            )}
          </Box>
        )}

        {tab === 2 && (
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, minHeight: 300, '& h1,h2,h3': { mt: 2, mb: 1 }, '& p': { mb: 1 }, '& ul,ol': { pl: 3 } }}>
            {content ? <ReactMarkdown>{content}</ReactMarkdown> : <Typography color="text.secondary">No content to preview</Typography>}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={!content.trim()}>
          {isEdit ? 'Save Changes' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
