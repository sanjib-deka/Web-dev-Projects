'use client'

import React from 'react'
import ProjectCard from '@/components/ProjectCard'
import { Projects } from '@/constants'

const Page = () => {
  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-center bg-cover"
      style={{ backgroundImage: 'url("/Mountains.jpg")' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[90%] max-h-[90%] overflow-y-auto p-4">
        {Projects.map((project, index) => (
          <ProjectCard
            key={index}
            title={project.title}
            text={project.text}
            image={project.src}
          />
        ))}
      </div>
    </div>
  )
}

export default Page
