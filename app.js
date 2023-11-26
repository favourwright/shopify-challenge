(()=>{
  const triggerName = "data-modal-trigger" // the attribute name that holds the modal name on the trigger element
  const modalAttrName = "data-modal-name" // the attribute name that holds the modal name on the modal element
  const modalActiveClass = "is-active" // added to modal when opened
  const activeModalTriggerAttrName = "data-associated-modal-open" // added to trigger when modal is open

  const getElementsFromAttr = ({attributeName, attributeValue, getAll}) => {
    if (!attributeName) return
    attributeValue = attributeValue || null
    getAll = getAll || false
    if (getAll && attributeValue) return document.querySelectorAll(`[${attributeName}="${attributeValue}"]`)
    if(getAll) return document.querySelectorAll(`[${attributeName}]`)
    if (attributeValue) return document.querySelector(`[${attributeName}="${attributeValue}"]`)
    return document.querySelector(`[${attributeName}]`)
  }
  /* @return {Boolean} */
  const isModalOpen = ({modalAttrName, modalName}) => {
    const modal = getElementsFromAttr({ attributeName:modalAttrName, attributeValue:modalName })
    if (!modal) return false
    return modal.classList.contains(modalActiveClass)
  }
  // add "data-associated-modal-open" to trigger so we can style it
  const toggleDataAttrOnModalTrigger = ({triggerName, modalName, toOpen}) => {
    return new Promise((resolve)=>{
      const trigger = getElementsFromAttr({ attributeName:triggerName, attributeValue:modalName })
      if (!trigger) return
      toOpen ? trigger.setAttribute(activeModalTriggerAttrName, true) : trigger.removeAttribute(activeModalTriggerAttrName)
      resolve()
    })
  }
  // open modal
  const handleOpenModal = ({modalAttrName, modalName}) => {
    const modal = getElementsFromAttr({ attributeName:modalAttrName, attributeValue:modalName })
    if (!modal) return false
    modal.classList.add(modalActiveClass)
    toggleDataAttrOnModalTrigger({triggerName, modalName, toOpen: true})
  }
  // close modal
  const handleCloseModal = ({modalAttrName, modalName}) => {
    return new Promise(async (resolve)=>{
      const modal = getElementsFromAttr({ attributeName:modalAttrName, attributeValue:modalName })
      if (!modal) return false
      modal.classList.remove(modalActiveClass)
      await toggleDataAttrOnModalTrigger({triggerName, modalName, toOpen: false})
      resolve()
    })
  }
  // close all open modals
  const closeAllModals = () => {
    return new Promise((resolve)=>{
      const modals = getElementsFromAttr({ attributeName:modalAttrName, attributeValue:null, getAll:true })
      if (!modals) return resolve()
      modals.forEach(async (modal)=>{
        const modalName = modal.getAttribute(modalAttrName)
        await handleCloseModal({modalAttrName, modalName})
      })
      resolve()
    })
  }
  // close modal when user clicks outside of it
  const handleModalCloseOnOutsideClick = () => {
    document.addEventListener('click', (e)=>{
      const modal = e.target.closest(`[${modalAttrName}]`)
      const clickedOnTrigger = e.target.closest(`[${triggerName}]`)
      if (!modal && !clickedOnTrigger) closeAllModals()
    })
  }
  // toggle modal
  const toggleModalVisibility = async ({e, modalAttrName, modalName}) => {
    e.preventDefault()
    const modalIsOpen = isModalOpen({modalAttrName, modalName})
    switch (modalIsOpen) {
      case true:
        handleCloseModal({modalAttrName, modalName})
        break
      case false:
        await closeAllModals()
        handleOpenModal({modalAttrName, modalName})
        break
    }
  }


  const removeElemTrigger = "data-remove-elem-trigger" // the attribute name for triggers for elements that should be removed once clicked
  const elemToRemoveAttrName = "data-remove-elem" // the attribute name for elements that should be removed once clicked

  const handleRemoveElem = ({elemToRemoveAttrName, elemToRemove}) => {
    const elemToRemoveEl = getElementsFromAttr({ attributeName:elemToRemoveAttrName, attributeValue:elemToRemove })
    if (!elemToRemoveEl) return false
    elemToRemoveEl.remove()
  }


  // bootstrap events
  const bootstrap = () => {
    // MODAL TRIGGER EVENTS
    const modalTriggers = getElementsFromAttr({ attributeName:triggerName, attributeValue:null, getAll:true })
    !!modalTriggers && modalTriggers.forEach((trigger)=>{
      const modalName = trigger.getAttribute(triggerName)
      trigger.addEventListener('click', (e)=>toggleModalVisibility({e, modalAttrName, modalName}))
    })
    handleModalCloseOnOutsideClick()


    // EVENT FOR REMOVING ELEMENTS FROM DOM WHEN ITS TRIGGER IS CLICKED
    const removeElemTriggers = getElementsFromAttr({ attributeName:removeElemTrigger, attributeValue:null, getAll:true })
    !!removeElemTriggers && removeElemTriggers.forEach((trigger)=>{
      const elemToRemove = trigger.getAttribute(removeElemTrigger)
      trigger.addEventListener('click', (e)=>handleRemoveElem({elemToRemoveAttrName, elemToRemove}))
    })
  }
  bootstrap()
})()