import React from 'react';

const Report = ({ reportData }) => {
  

  return (
    <div className="p-4 mx-auto max-w-[1000px]">
      <table className="w-full border-collapse border border-gray-800">
        <tbody>
          {/* Header Row */}
          <tr>
            <td colSpan={14} className="text-center border border-gray-800 p-2 font-bold">
              PRODUCTION REPORT
            </td>
          </tr>

          {/* Name and Machine Number Rows */}
          <tr>
            <td colSpan={2} rowSpan={4} className="border border-gray-800"></td>
            <td colSpan={2} rowSpan={2} className="text-center border border-gray-800">NAME</td>
            <td colSpan={8} rowSpan={2} className="border border-gray-800">{reportData?.operator_name || ''}</td>
          </tr>
          <tr>
            <td className="border border-gray-800"></td>
          </tr>

          {/* Date and Shift Info */}
          <tr>
            <td colSpan={2} className="text-center border border-gray-800">DATE</td>
            <td colSpan={4} className="border border-gray-800">{reportData?.report_date || ''}</td>
            <td className="text-center border border-gray-800">SHIFT</td>
            <td className="border border-gray-800">{reportData?.shift || ''}</td>
            <td rowSpan={2} className="text-center border border-gray-800">QTY</td>
            <td className="text-center border border-gray-800">RG</td>
            <td className="border border-gray-800"></td>
          </tr>
          <tr>
            <td colSpan={2} className="text-center border border-gray-800">SHIFT/TIME</td>
            <td colSpan={2} className="border border-gray-800">{reportData?.shift_time || ''}</td>
            <td colSpan={2} className="border border-gray-800"></td>
            <td className="text-center border border-gray-800">M/C NO</td>
            <td className="border border-gray-800">{reportData?.machine_number || ''}</td>
            <td className="text-center border border-gray-800">MFG</td>
            <td className="border border-gray-800"></td>
          </tr>

          {/* Column Headers */}
          <tr>
            <td className="text-center border border-gray-800 p-2">START</td>
            <td className="text-center border border-gray-800 p-2">END</td>
            <td className="text-center border border-gray-800 p-2">W.O</td>
            <td className="text-center border border-gray-800 p-2">PROCESS</td>
            <td className="text-center border border-gray-800 p-2">DIA</td>
            <td className="text-center border border-gray-800 p-2">ITEM NAME</td>
            <td className="text-center border border-gray-800 p-2">QTY</td>
            <td className="text-center border border-gray-800 p-2">SET-UP TIME</td>
            <td className="text-center border border-gray-800 p-2">M/C TIME</td>
            <td className="text-center border border-gray-800 p-2">LOADING-UNLOADING</td>
            <td colSpan={2} className="text-center border border-gray-800 p-2">FLD/BREAK DOWN</td>
            <td className="text-center border border-gray-800 p-2">NO-LOAD</td>
          </tr>

          {/* Panel Entries Rows */}
          {reportData?.panel_entries?.map((entry, index) => (
            <tr key={index}>
              <td className="border border-gray-800 p-2">{entry.start_time || ''}</td>
              <td className="border border-gray-800 p-2">{entry.end_time || ''}</td>
              <td className="border border-gray-800 p-2">{entry.work_order || ''}</td>
              <td className="border border-gray-800 p-2">{entry.process || ''}</td>
              <td className="border border-gray-800 p-2">{entry.dia || ''}</td>
              <td className="border border-gray-800 p-2">{entry.item_name || ''}</td>
              <td className="border border-gray-800 p-2">{entry.quantity || ''}</td>
              <td className="border border-gray-800 p-2">{entry.setup_time || ''}</td>
              <td className="border border-gray-800 p-2">{entry.mc_time || ''}</td>
              <td className="border border-gray-800 p-2">{entry.loading_unloading_time || ''}</td>
              <td colSpan={2} className="border border-gray-800 p-2">{entry.fld_breakdown_time || ''}</td>
              <td className="border border-gray-800 p-2">{entry.no_load_time || ''}</td>
            </tr>
          ))}

          {/* Bottom Section */}
          <tr>
            <td colSpan={2} className="text-center border border-gray-800"></td>
            <td className="text-center border border-gray-800">YES</td>
            <td className="text-center border border-gray-800">NO</td>
            <td className="text-center border border-gray-800">NL</td>
            <td colSpan={8} className="border border-gray-800"></td>
          </tr>

          {/* Quality Section */}
          <tr>
            <td colSpan={2} className="text-center border border-gray-800">QUALITY REWORK</td>
            <td className="border border-gray-800 text-center">{reportData?.quality_rework === 'yes' ? '✓' : ''}</td>
            <td className="border border-gray-800 text-center">{reportData?.quality_rework === 'no' ? '✓' : ''}</td>
            <td className="border border-gray-800">{reportData?.quality_rework === 'nl' ? '✓' : ''}</td>
            <td colSpan={3} className="text-center border border-gray-800">IDEAL TIME</td>
            <td colSpan={5} className="border border-gray-800">{reportData?.ideal_time || ''}</td>
          </tr>

          <tr>
            <td colSpan={2} className="text-center border border-gray-800">REJECTION</td>
            <td className="border border-gray-800 text-center">{reportData?.rejection === 'yes' ? '✓' : ''}</td>
            <td className="border border-gray-800 text-center">{reportData?.rejection === 'no' ? '✓' : ''}</td>
            <td className="border border-gray-800">{reportData?.rejection === 'nl' ? '✓' : ''}</td>
            <td colSpan={3} className="text-center border border-gray-800">ACTUAL TIME</td>
            <td colSpan={5} className="border border-gray-800">{reportData?.actual_time || ''}</td>
          </tr>

          <tr>
            <td colSpan={2} rowSpan={2} className="text-center border border-gray-800 border-b-0">MULTI M/C OPERAT</td>
            <td className="border border-gray-800 text-center">{reportData?.multi_machine_operat === 'yes' ? '✓' : ''}</td>
            <td className="border border-gray-800 text-center">{reportData?.multi_machine_operat === 'no' ? '✓' : ''}</td>
            <td className="border border-gray-800 text-center">{reportData?.multi_machine_operat === 'nl' ? '✓' : ''}</td>
            <td colSpan={3} className="text-center border border-gray-800">TIME LOSS NO LOAD</td>
            <td colSpan={5} className="border border-gray-800">{reportData?.time_loss_no_load || ''}</td>
          </tr>


          <tr>
            <td className="border border-gray-800"></td>
            <td className="border border-gray-800"></td>
            <td className="border border-gray-800"></td>
            <td colSpan={3} className="text-center border border-gray-800">TOTAL TIME LOSS</td>
            <td colSpan={5} className="border border-gray-800">{reportData?.total_time_loss || ''}</td>
          </tr>

        </tbody>
      </table>
    </div>
  );
};

export default Report;