import { ref } from 'vue';

export function useWorkspaceRoute() {
  const workspaceRoot = 'workspace-root';

  const selectedNodeKey = ref(workspaceRoot);

  const traveledNodeKey = ref(workspaceRoot);

  function getRoute(id: string): string {
    if (id === workspaceRoot) {
      return '/workspace';
    }
    return `/workspace/${id}`;
  }

  function getRootRoute(): string {
    return '/workspace';
  }

  return {
    workspaceRoot,
    selectedNodeKey,
    traveledNodeKey,
    getRoute,
    getRootRoute,
  };
}
