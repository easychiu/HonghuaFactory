import { useGame } from '../contexts/GameContext';
import type { AdventureMapNode } from '../types';

export const useAdventure = () => {
  const { state, stepAdventure, endAdventure } = useGame();
  const { adventure, daughter, inventory } = state;

  if (!adventure) {
    return {
      adventure: null,
      currentNode: null,
      reachableNodes: [],
      hasMotorcycle: false,
      focusCost: 4,
      isJumboHammerEquipped: false,
      isNodeReachable: () => false,
      handleNodeClick: () => {},
      endAdventure
    };
  }

  const currentNode = adventure.nodes.find(n => n.id === adventure.currentNodeId) || adventure.nodes[0];
  
  // Calculate motorcycle discount
  const hasMotorcycle = inventory.includes('future_gp125');
  const focusCost = hasMotorcycle ? 1 : 4;

  // Check if jumbo hammer is equipped (must be Emilia and have giant_hammer in inventory)
  const isJumboHammerEquipped = daughter.characterId === 'emilia' && inventory.includes('giant_hammer');

  // Find reachable nodes: must be in the next layer and connected from the current node
  const getReachableNodes = (): AdventureMapNode[] => {
    if (!currentNode) return [];
    
    // If current node is cleared and we want to move to next layer
    const nextLayerNodes = adventure.nodes.filter(n => 
      n.layer === currentNode.layer + 1 && 
      currentNode.connectedTo.includes(n.id)
    );
    
    return nextLayerNodes;
  };

  const reachableNodes = getReachableNodes();

  const isNodeReachable = (nodeId: string): boolean => {
    return reachableNodes.some(n => n.id === nodeId);
  };

  const handleNodeClick = (nodeId: string) => {
    if (!isNodeReachable(nodeId)) return;
    
    // Focus check: if not enough focus, print/return? 
    // In context, daughter.focus is updated. But let's check here as well to prevent movement if focus is 0.
    if (daughter.focus < focusCost) {
      alert('專注度不足，無法繼續冒險！請點擊結束修行。');
      return;
    }

    stepAdventure(nodeId);
  };

  return {
    adventure,
    currentNode,
    reachableNodes,
    hasMotorcycle,
    focusCost,
    isJumboHammerEquipped,
    isNodeReachable,
    handleNodeClick,
    endAdventure
  };
};
