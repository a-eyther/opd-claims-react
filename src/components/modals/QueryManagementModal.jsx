import { useState } from 'react'

/**
 * Query Management Modal Component
 * Displays query conversation thread with LCT and Editor messages
 */
const QueryManagementModal = ({ isOpen, onClose, claimId = 'CLM-2025-0002314' }) => {
  const [activeRecipient, setActiveRecipient] = useState('LCT')
  const [message, setMessage] = useState('')
  const [selectedTemplates, setSelectedTemplates] = useState([])
  const [attachedFiles, setAttachedFiles] = useState([])

  const messages = [
    {
      id: 1,
      sender: 'Sarah Kimani',
      role: 'LCT',
      time: '10:30 AM',
      text: 'Please provide the prescription details for the H-Pylori Kit mentioned in the claim.',
      status: 'Sent',
      avatar: 'SK'
    },
    {
      id: 2,
      sender: 'John Mwangi',
      role: 'Editor',
      time: '02:45 PM',
      text: 'Prescription attached. The H-Pylori Kit was prescribed by Dr. Smith for gastric issues.',
      status: 'Seen',
      avatar: 'JM',
      attachment: {
        name: 'prescription_hp_kit.pdf',
        type: 'PDF'
      }
    },
    {
      id: 3,
      sender: 'Sarah Kimani',
      role: 'LCT',
      time: '09:15 AM',
      text: 'Invoice date seems incorrect. Please verify.',
      status: 'Seen',
      avatar: 'SK'
    }
  ]

  const quickTemplates = [
    'Please provide additional documentation.',
    'The invoice appears to be missing required information.',
    'Medical necessity documentation is required.',
    'Please clarify the treatment dates.',
    'Additional diagnostic reports needed.'
  ]

  const handleTemplateClick = (template) => {
    // Only one template can be selected at a time
    if (selectedTemplates.includes(template)) {
      // Deselect if clicking the same template
      setSelectedTemplates([])
      setMessage('')
    } else {
      // Select new template and replace message
      setSelectedTemplates([template])
      setMessage(template)
    }
  }

  const handleFileAttach = (event) => {
    const files = Array.from(event.target.files)
    setAttachedFiles([...attachedFiles, ...files])
  }

  const handleRemoveFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    // Prepare form data for API
    const formData = new FormData()
    formData.append('message', message)
    formData.append('recipient', activeRecipient)
    formData.append('claimId', claimId)

    // Add selected templates
    selectedTemplates.forEach((template, index) => {
      formData.append(`templates[${index}]`, template)
    })

    // Add attached files
    attachedFiles.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file)
    })

    try {
      // Send to API
      console.log('Sending query message:', {
        message,
        recipient: activeRecipient,
        templates: selectedTemplates,
        files: attachedFiles.map(f => f.name)
      })

      // TODO: Replace with actual API call
      // const response = await fetch('/api/queries', {
      //   method: 'POST',
      //   body: formData
      // })

      // Reset form
      setMessage('')
      setSelectedTemplates([])
      setAttachedFiles([])

    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-blue-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Query Management</h2>
              <p className="text-[11px] text-gray-500">{claimId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Messages Count */}
        <div className="px-5 py-2 text-[11px] text-gray-500 bg-gray-50">
          {messages.length} messages
        </div>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 bg-white">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              {/* Avatar */}
              <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-semibold ${
                msg.role === 'LCT' ? 'bg-blue-500' : 'bg-purple-500'
              }`}>
                {msg.avatar}
              </div>

              {/* Message Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[13px] font-semibold text-gray-900">{msg.sender}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    msg.role === 'LCT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {msg.role}
                  </span>
                  <span className="text-[11px] text-gray-500">{msg.time}</span>
                </div>
                <p className="text-[13px] text-gray-700 leading-relaxed mb-2">{msg.text}</p>

                {/* Attachment */}
                {msg.attachment && (
                  <div className="flex items-center gap-2 mb-2 bg-gray-50 rounded px-2 py-1.5 w-fit">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-gray-400">
                      <path d="M9.5 1.5v3.5a1.5 1.5 0 001.5 1.5h3.5L9.5 1.5z"/>
                      <path d="M9 0H4a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7h-4.5A1.5 1.5 0 018 5.5V0z"/>
                    </svg>
                    <a href="#" className="text-[11px] text-blue-600 hover:underline">
                      {msg.attachment.name}
                    </a>
                    <span className="text-[10px] text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                      {msg.attachment.type}
                    </span>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-end">
                  <div className={`text-[11px] font-medium ${
                    msg.status === 'Seen' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {msg.status} {msg.status === 'Seen' && '✓'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input Section */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {/* Recipient Selection */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-gray-600 font-medium">To:</span>
            <button
              onClick={() => setActiveRecipient('LCT')}
              className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                activeRecipient === 'LCT'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              LCT
            </button>
            <button
              onClick={() => setActiveRecipient('Auditor')}
              className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                activeRecipient === 'Auditor'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Auditor
            </button>
          </div>

          {/* Quick Templates */}
          <div className="mb-3">
            <div className="text-[11px] text-gray-600 font-medium mb-2">Quick Templates</div>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateClick(template)}
                  className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                    selectedTemplates.includes(template)
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* Attached Files Display */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 space-y-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2">
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-gray-400">
                      <path d="M9.5 1.5v3.5a1.5 1.5 0 001.5 1.5h3.5L9.5 1.5z"/>
                      <path d="M9 0H4a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7h-4.5A1.5 1.5 0 018 5.5V0z"/>
                    </svg>
                    <span className="text-[11px] text-gray-700">{file.name}</span>
                    <span className="text-[10px] text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Message Input */}
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows="3"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
            />
            <input
              type="file"
              id="file-attachment"
              multiple
              onChange={handleFileAttach}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label
              htmlFor="file-attachment"
              className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
              </svg>
            </label>
          </div>

          {/* Send Button */}
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded text-[12px] font-medium hover:bg-blue-600 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M15.854.146a.5.5 0 01.11.54l-5.819 14.547a.75.75 0 01-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 01.124-1.33L15.314.037a.5.5 0 01.54.11z"/>
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QueryManagementModal
