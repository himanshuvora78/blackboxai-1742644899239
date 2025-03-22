import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

function MovesHistory({ moves }) {
  const getMoveNotation = (move) => {
    if (move.san) {
      return move.san; // Use Standard Algebraic Notation if available
    }
    const piece = move.piece ? move.piece.toUpperCase() : '';
    return `${piece}${move.from}-${move.to}`;
  };

  const formatTimestamp = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'tutor':
        return '#2196f3'; // Blue
      case 'student':
        return '#4caf50'; // Green
      default:
        return '#757575'; // Grey
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        Moves History
        {moves.length > 0 && (
          <Chip 
            label={`${moves.length} moves`}
            size="small"
            sx={{ backgroundColor: '#e3f2fd' }}
          />
        )}
      </Typography>
      
      <Box sx={{ 
        maxHeight: 400, 
        overflow: 'auto',
        borderRadius: 1,
        backgroundColor: '#fafafa'
      }}>
        {moves.length === 0 ? (
          <Typography sx={{ 
            p: 3, 
            textAlign: 'center', 
            color: 'text.secondary',
            fontStyle: 'italic'
          }}>
            No moves recorded yet
          </Typography>
        ) : (
          <List className="moves-list" dense>
            {moves.map((move, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ py: 1 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Typography variant="body1">
                          <span style={{ color: '#9e9e9e' }}>
                            {`${Math.floor(index / 2) + 1}${index % 2 === 0 ? '.' : '...'}`}
                          </span>
                          {' '}
                          <span style={{ fontWeight: 500 }}>
                            {getMoveNotation(move)}
                          </span>
                        </Typography>
                        <Chip
                          label={move.role}
                          size="small"
                          sx={{
                            backgroundColor: getRoleColor(move.role),
                            color: 'white',
                            fontSize: '0.75rem',
                            height: 24
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          display: 'block',
                          mt: 0.5
                        }}
                      >
                        {formatTimestamp(move.timestamp)}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < moves.length - 1 && (
                  <Divider sx={{ opacity: 0.5 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}

export default MovesHistory;