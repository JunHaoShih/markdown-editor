import { useWorkspaceRoute } from 'src/modules/folderViews/composables/useWorkspaceRoute';
import {
  describe, expect, it,
} from 'vitest';

describe('Test useWorkspaceRoute', () => {
  it.concurrent('Test root id', () => {
    const { workspaceRoot } = useWorkspaceRoute();
    expect(workspaceRoot).toBe('workspace-root');
  });

  it.concurrent('Test getRoute on non root', () => {
    const { getRoute } = useWorkspaceRoute();
    const route = getRoute('test');
    expect(route).toBe('/workspace/test');
  });

  it.concurrent('Test getRoute on root', () => {
    const { workspaceRoot, getRoute } = useWorkspaceRoute();
    const route = getRoute(workspaceRoot);
    expect(route).toBe('/workspace');
  });

  it.concurrent('Test getRootRoute', () => {
    const { getRootRoute } = useWorkspaceRoute();
    const route = getRootRoute();
    expect(route).toBe('/workspace');
  });
});
