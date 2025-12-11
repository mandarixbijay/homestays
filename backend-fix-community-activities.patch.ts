// BACKEND FIX: Update method in community.service.ts
//
// PROBLEM: The update method extracts meals and activities but never updates them
// Line ~120-140 in community.service.ts

async update(id: number, updateDto: UpdateCommunityDto) {
  // Check if community exists
  await this.findOne(id);

  // If manager is being updated, verify new manager exists
  if (updateDto.managerId) {
    const manager = await this.prisma.communityManager.findUnique({
      where: { id: updateDto.managerId },
    });

    if (!manager) {
      throw new NotFoundException(`Community manager with ID ${updateDto.managerId} not found`);
    }
  }

  // If name is being updated, check for conflicts
  if (updateDto.name) {
    const existingCommunity = await this.prisma.community.findUnique({
      where: { name: updateDto.name },
    });

    if (existingCommunity && existingCommunity.id !== id) {
      throw new ConflictException('Community with this name already exists');
    }
  }

  const { meals, activities, ...communityData } = updateDto;

  // Update community with meals and activities
  const community = await this.prisma.$transaction(async (tx) => {
    // Update basic community data
    const updatedCommunity = await tx.community.update({
      where: { id },
      data: communityData,
    });

    // Handle meals update
    if (meals !== undefined) {
      // Delete existing meals
      await tx.communityMeal.deleteMany({
        where: { communityId: id },
      });

      // Create new meals
      if (meals.length > 0) {
        await tx.communityMeal.createMany({
          data: meals.map((meal) => ({
            communityId: id,
            ...meal,
          })),
        });
      }
    }

    // Handle activities update
    if (activities !== undefined) {
      // Delete existing activities
      await tx.communityActivity.deleteMany({
        where: { communityId: id },
      });

      // Create new activities (with images!)
      if (activities.length > 0) {
        await tx.communityActivity.createMany({
          data: activities.map((activity) => ({
            communityId: id,
            ...activity,
          })),
        });
      }
    }

    // Fetch the updated community with all relations
    return tx.community.findUnique({
      where: { id },
      include: {
        manager: true,
        meals: true,
        activities: true,
        homestays: {
          include: {
            homestay: {
              include: {
                rooms: true,
              },
            },
          },
        },
      },
    });
  });

  return this.formatCommunityResponse(community);
}
