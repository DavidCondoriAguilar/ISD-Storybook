import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TableBody = ({ data, columns }) => {
  const rowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  };

  return (
    <tbody className="dt-tbody">
      {data.length === 0 ? (
        <tr className="dt-tr">
          <td colSpan={columns.length + 1} className="dt-empty">
            Sin registros auditados en esta vista.
          </td>
        </tr>
      ) : (
        data.map((row, i) => (
          <tr 
            key={row.idLocal || row.id || i}
            className="dt-tr dt-row-hover"
          >
            <td className="dt-td dt-idx-cell">{i + 1}</td>
            {columns.map(col => (
              <td 
                key={col.key} 
                className={`dt-td dt-col-${col.key}`}
                style={{ 
                  textAlign: col.align || 'left',
                  width: col.width,
                  minWidth: col.width
                }}
              >
                <div className="dt-td-inner">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </div>
              </td>
            ))}
          </tr>
        ))
      )}
    </tbody>
  );
};
