import { create } from 'zustand';
import { mockData } from '../utils/mockData';

const useClaimsStore = create((set, get) => ({
  claims: mockData.claims,
  filteredClaims: mockData.claims,
  currentClaim: null,
  filters: {
    status: '',
    claimType: 'OPD',
    provider: '',
    searchTerm: '',
    dateRange: { start: null, end: null }
  },
  
  setClaims: (claims) => set({ claims }),
  
  setCurrentClaim: (claimId) => {
    const claim = mockData.claimDetails[claimId] || mockData.claimDetails['ABHI28800381331'];
    set({ currentClaim: claim });
  },
  
  applyFilters: () => {
    const { claims, filters } = get();
    let filtered = [...claims];
    
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    
    if (filters.claimType) {
      filtered = filtered.filter(c => c.claimType === filters.claimType);
    }
    
    if (filters.provider) {
      filtered = filtered.filter(c => c.providerName === filters.provider);
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.claimUniqueId.toLowerCase().includes(term) ||
        c.providerName.toLowerCase().includes(term)
      );
    }
    
    set({ filteredClaims: filtered });
  },
  
  setFilter: (key, value) => {
    set(state => ({
      filters: { ...state.filters, [key]: value }
    }));
    get().applyFilters();
  },
  
  clearFilters: () => {
    set({
      filters: {
        status: '',
        claimType: 'OPD',
        provider: '',
        searchTerm: '',
        dateRange: { start: null, end: null }
      }
    });
    get().applyFilters();
  }
}));

export default useClaimsStore;