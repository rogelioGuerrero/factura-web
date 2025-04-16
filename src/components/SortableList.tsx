// src/components/SortableList.tsx
import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface SortableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function SortableList<T extends { id: string }>({ 
  items, 
  onReorder, 
  renderItem 
}: SortableListProps<T>) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);
    
    onReorder(reorderedItems);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="components">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div className="flex items-center">
                      <div 
                        {...provided.dragHandleProps}
                        className="mr-2 cursor-move p-2"
                      >
                        ⋮⋮
                      </div>
                      <div className="flex-1">
                        {renderItem(item, index)}
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default SortableList;