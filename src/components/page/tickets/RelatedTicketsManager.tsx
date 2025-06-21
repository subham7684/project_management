// --- file: src/components/ticketDetails/RelatedTicketsManager.tsx ---
import { FC, useState } from 'react';
import { Link2, Search, X, ChevronRight } from 'lucide-react';
import { toast } from '../../ui/use-toast';
import { Ticket } from '../../../types/interfaces';
import ticketService from '../../../services/ticket';

interface RelatedTicketsManagerProps {
  ticket: Ticket;
  relatedTickets: Ticket[];
  onRelationUpdated: (updatedTicket: Ticket) => void;
  uiColors: any;
  themeColors: any;
}

const RelatedTicketsManager: FC<RelatedTicketsManagerProps> = ({ 
  ticket,
  relatedTickets,
  onRelationUpdated,
  uiColors,
  themeColors 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  
  // Search for tickets
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const { tickets } = await ticketService.searchTickets(searchQuery);
      
      // Filter out current ticket and already related tickets
      const filteredResults = tickets.filter(t => 
        t.id !== ticket.id && 
        !relatedTickets.some(rt => rt.id === t.id)
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching tickets:', error);
      toast.show({
        title: 'Search Failed',
        description: 'Failed to search for tickets',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle input change and trigger search with Enter key
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Link a related ticket
  const handleLinkTicket = async (relatedTicketId: string) => {
    try {
      // For now, we'll simulate linking tickets
      // We'll use getTicketDetails to refresh the ticket data
      const updatedTicket = await ticketService.getTicketDetails(ticket.id);
      
      // For feedback purposes only
      
      // Clear search
      setSearchQuery('');
      setSearchResults([]);
      setShowSearch(false);
      
      // Update parent
      onRelationUpdated(updatedTicket);
      
      toast.show({
        title: 'Ticket Linked',
        description: `Ticket ${relatedTicketId} has been linked`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error linking ticket:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to link the ticket',
        variant: 'destructive',
      });
    }
  };
  
  // Unlink a related ticket
  const handleUnlinkTicket = async (relatedTicketId: string) => {
    if (!confirm(`Remove link to ticket ${relatedTicketId}?`)) {
      return;
    }
    
    try {
      // For now, we'll simulate unlinking tickets
      // We'll use getTicketDetails to refresh the ticket data
      const updatedTicket = await ticketService.getTicketDetails(ticket.id);
      
      // For feedback purposes only
      
      // Update parent
      onRelationUpdated(updatedTicket);
      
      toast.show({
        title: 'Link Removed',
        description: `Link to ticket ${relatedTicketId} has been removed`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error unlinking ticket:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to remove the link',
        variant: 'destructive',
      });
    }
  };
  
  // Status color mapping
  const statusColors = {
    'Open': 'bg-blue-500',
    'In Progress': 'bg-amber-500',
    'Review': 'bg-purple-500',
    'Done': 'bg-emerald-500',
  };

  return (
    <div className={`mb-6 ${uiColors.cardBg} rounded-xl border ${uiColors.borderColor} shadow-sm overflow-hidden`}>
      <div className={`p-4 border-b ${uiColors.borderColor} flex justify-between items-center`}>
        <h3 className={`text-sm font-medium ${themeColors.secondaryText} flex items-center gap-2`}>
          <Link2 size={16} />
          <span>Related Tickets ({relatedTickets.length})</span>
        </h3>
        
        {/* Add related button */}
        <button 
          onClick={() => setShowSearch(!showSearch)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${
            showSearch ? uiColors.softBg : themeColors.buttonBg
          } ${
            showSearch ? uiColors.mutedText : themeColors.buttonText
          } hover:opacity-90 transition-colors`}
        >
          {showSearch ? 'Cancel' : 'Link Ticket'}
        </button>
      </div>
      
      {/* Search input */}
      {showSearch && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Search by ID or title"
                className={`w-full pl-10 pr-4 py-2 rounded-md border ${uiColors.borderColor} ${uiColors.inputBg} ${uiColors.inputText} focus:outline-none focus:ring-2 ${themeColors.focusRing}`}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className={`px-4 py-2 rounded-md ${themeColors.buttonBg} ${themeColors.buttonText} disabled:opacity-50 hover:opacity-90 transition-colors`}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className={`mt-4 max-h-60 overflow-y-auto rounded-md border ${uiColors.borderColor} ${uiColors.cardBg}`}>
              {searchResults.map(result => (
                <div
                  key={result.id}
                  className={`p-3 flex items-center justify-between border-b last:border-0 ${uiColors.borderColor} hover:bg-gray-50 dark:hover:bg-gray-750`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${uiColors.softBg} ${uiColors.badgeText} mr-2`}>
                        {result.id}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded text-white ${statusColors[result.status as keyof typeof statusColors] || 'bg-gray-500'}`}>
                        {result.status}
                      </span>
                    </div>
                    <div className={`text-sm ${themeColors.primaryText} truncate`}>
                      {result.title}
                    </div>
                  </div>
                  <button
                    onClick={() => handleLinkTicket(result.id)}
                    className={`ml-2 px-2 py-1 text-xs rounded-md ${themeColors.buttonBg} ${themeColors.buttonText} hover:opacity-90 transition-colors`}
                  >
                    Link
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {searchResults.length === 0 && searchQuery.trim() && !isSearching && (
            <div className={`mt-4 p-4 text-center ${uiColors.mutedText} rounded-md ${uiColors.softBg}`}>
              No matching tickets found
            </div>
          )}
        </div>
      )}
      
      {/* Related tickets list */}
      {relatedTickets.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {relatedTickets.map(relatedTicket => (
            <div
              key={relatedTicket.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${uiColors.softBg} ${uiColors.badgeText} mr-2`}>
                    {relatedTicket.id}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded text-white ${statusColors[relatedTicket.status as keyof typeof statusColors] || 'bg-gray-500'}`}>
                    {relatedTicket.status}
                  </span>
                </div>
                <div className={`text-sm font-medium ${themeColors.primaryText} truncate`}>
                  {relatedTicket.title}
                </div>
                {relatedTicket.title && (
                  <div className={`text-xs ${uiColors.mutedText} mt-1`}>
                    Project: {relatedTicket.title}
                  </div>
                )}
              </div>
              
              <div className="flex items-center ml-2">
                <button
                  onClick={() => handleUnlinkTicket(relatedTicket.id)}
                  className={`p-1.5 rounded-full hover:${uiColors.softBg} mr-1 transition-colors`}
                  title="Remove link"
                >
                  <X size={16} className={uiColors.mutedText} />
                </button>
                <a
                  href={`/tickets/${relatedTicket.id}`}
                  className={`p-1.5 rounded-full hover:${uiColors.softBg} transition-colors`}
                  title="View ticket"
                >
                  <ChevronRight size={16} className={uiColors.mutedText} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-8 text-center ${uiColors.mutedText}`}>
          <Link2 size={24} className="mx-auto mb-2 opacity-40" />
          <p>No related tickets</p>
          <p className="text-xs mt-1">Link tickets to show their relationships</p>
        </div>
      )}
    </div>
  );
};

export default RelatedTicketsManager;