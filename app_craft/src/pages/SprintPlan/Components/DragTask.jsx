import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import styles from '../css/DragTask.module.css';

const DragTask = ({ task, index, onClick }) => {
    return (
        <Draggable key={task.id} draggableId={task.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={styles['drag-task']}
                    onClick={() => onClick(task)}
                >
                    <div className={styles['drag-task-details']}>
                        <div className={styles['drag-task-title']}>{task.name}</div>
                        <div className={styles['drag-task-tags']}>
                            {task.tags.map((tag, idx) => (
                                <span key={idx} className={`${styles['drag-tag']} ${styles[tag.toLowerCase()]}`}>{tag}</span>
                            ))}
                        </div>
                        <div className={`${styles['drag-task-priority']} ${styles[task.priority.toLowerCase()]}`}>{task.priority}</div>
                        <div className={styles['drag-task-story-points']}>{task.storyPoints}</div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default DragTask;