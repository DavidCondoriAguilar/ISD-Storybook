import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TableBody = ({ data, columns }) => {
  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
  };

  return (
    <tbody className="dt-tbody">
      <AnimatePresence mode="popLayout">
        {data.length === 0 ? (
          <motion.tr 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="dt-tr"
          >
            <td colSpan={columns.length + 1} className="dt-empty">
              Sin registros auditados en esta vista.
            </td>
          </motion.tr>
        ) : (
          data.map((row, i) => (
            <motion.tr 
              key={row.idLocal || row.id || i}
              custom={i}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={rowVariants}
              whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.04)" }}
              className="dt-tr"
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
            </motion.tr>
          ))
        )}
      </AnimatePresence>
    </tbody>
  );
};
