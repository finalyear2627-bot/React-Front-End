import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Icon } from '@iconify/react/dist/iconify.js';

const TaskCard = ({ task, index, onEdit, onDelete, onDuplicate }) => {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                                        ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        userSelect: 'none',
                        background: snapshot.isDragging ? '#f0f0f0' : '#ffffff',
                        ...provided.draggableProps.style,
                    }}
                >
                    {task.image && (
                        <div
                            className="radius-8 mb-2 overflow-hidden"
                            style={{ maxHeight: '200px' }}
                        >
                            <img
                                src={task.image}
                                alt=""
                                className="w-100 h-100 object-fit-cover"
                            />
                        </div>
                    )}
                    
                    <button
                        type="button"
                        className="btn text-primary-600 border rounded border-primary-600 bg-hover-primary-600 text-hover-white d-flex align-items-center gap-2 mb-2"
                    >

                        <Icon icon="lucide:tag"
                            className="icon text-lg"></Icon>
                                           </button>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2 pt-3">

                            <Icon icon="solar:calendar-outline"
                                className="icon text-lg line-height-1"></Icon>
                            <span className="start-date text-secondary-light">
                                {new Date(task.date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className="card-edit-button text-success-600"
                                onClick={onEdit}
                            >

                                <Icon icon="lucide:edit"
                                    className="icon text-lg"></Icon>
                            </button>
                            <button type="button" className="card-delete-button text-danger-600">
                                <Icon onClick={onDelete} icon="fluent:delete-24-regular" className="icon text-lg line-height-1"></Icon>
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;
